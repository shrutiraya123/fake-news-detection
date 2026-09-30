from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework import status

import requests
from bs4 import BeautifulSoup

from .models import LiveNews
from .serializers import LiveNewsDetailedSerializer
from core.model import load_models

import threading
import time
import os

# ============================================================
# GUARDIAN NEWS API
# ============================================================

GUARDIAN_API_URL = "https://content.guardianapis.com/search"

# Put your API key in an environment variable:
# Linux/macOS:
# export GUARDIAN_API_KEY="your-api-key"
#
# Or use a .env file with python-dotenv.
GUARDIAN_API_KEY = os.getenv("GUARDIAN_API_KEY")


def get_new_news_from_api_and_update():
    """
    Fetch news from The Guardian API and save new articles
    into the LiveNews database.
    """

    if not GUARDIAN_API_KEY:
        print("ERROR: GUARDIAN_API_KEY environment variable is not set.")
        return

    params = {
        "api-key": GUARDIAN_API_KEY,
        "show-fields": "thumbnail",
        "page-size": 20,
    }

    # --------------------------------------------------------
    # Get news from Guardian API
    # --------------------------------------------------------

    try:
        api_response = requests.get(
            GUARDIAN_API_URL,
            params=params,
            timeout=15,
        )

        print("Guardian API status:", api_response.status_code)

        api_response.raise_for_status()

        news_data = api_response.json()

    except requests.exceptions.Timeout:
        print("Guardian API request timed out.")
        return

    except requests.exceptions.RequestException as e:
        print(f"Guardian API request failed: {e}")
        return

    except ValueError as e:
        print(f"Guardian API returned invalid JSON: {e}")
        return

    # --------------------------------------------------------
    # Extract response safely
    # --------------------------------------------------------

    response_data = news_data.get("response", {})

    if not response_data:
        print("Guardian API response is missing 'response'.")
        print("API response:", news_data)
        return

    results = response_data.get("results", [])

    if not results:
        print("Guardian API returned no articles.")
        return

    print(f"Found {len(results)} articles.")

    # --------------------------------------------------------
    # Load ML models
    # --------------------------------------------------------

    try:
        nb_model, vect_model = load_models()

    except Exception as e:
        print(f"Failed to load ML models: {e}")
        return

    # --------------------------------------------------------
    # Image scraper
    # --------------------------------------------------------

    def scrap_img_from_web(url):
        """
        Try to extract an image from a Guardian article.
        Returns 'None' if no image can be found.
        """

        try:
            print(f"Scraping image: {url}")

            r = requests.get(
                url,
                timeout=15,
                headers={
                    "User-Agent": (
                        "Mozilla/5.0 "
                        "(Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 "
                        "(KHTML, like Gecko) "
                        "Chrome/120.0 Safari/537.36"
                    )
                },
            )

            if r.status_code != 200:
                print(f"Could not access article. " f"Status code: {r.status_code}")
                return "None"

            soup = BeautifulSoup(r.content, "html.parser")

            # First try Open Graph image.
            og_image = soup.find("meta", property="og:image")

            if og_image:
                image_url = og_image.get("content")

                if image_url:
                    return image_url

            # Fallback: look inside article
            article = soup.find("article")

            if not article:
                return "None"

            images = article.find_all("img")

            for img in images:
                src = img.get("src")

                if src:
                    return src

            return "None"

        except requests.exceptions.Timeout:
            print(f"Image request timed out: {url}")
            return "None"

        except requests.exceptions.RequestException as e:
            print(f"Image request failed: {e}")
            return "None"

        except Exception as e:
            print(f"Image scraping failed: {e}")
            return "None"

    # --------------------------------------------------------
    # Process every article
    # --------------------------------------------------------

    for article in results:

        try:
            # ------------------------------------------------
            # Get article information safely
            # ------------------------------------------------

            title_ = article.get("webTitle")
            publication_date_ = article.get("webPublicationDate")
            category_ = article.get("pillarName", "Undefined")
            section_id_ = article.get("sectionId", "Undefined")
            section_name_ = article.get("sectionName", "Undefined")
            type_ = article.get("type", "Undefined")
            web_url_ = article.get("webUrl")

            # ------------------------------------------------
            # Validate required fields
            # ------------------------------------------------

            if not title_:
                print("Skipping article without title.")
                continue

            if not web_url_:
                print(f"Skipping article without URL: {title_}")
                continue

            # ------------------------------------------------
            # Check duplicate
            # ------------------------------------------------

            if LiveNews.objects.filter(web_url=web_url_).exists():

                print(f"Already exists: {title_}")

                continue

            # ------------------------------------------------
            # ML prediction
            # ------------------------------------------------

            try:
                vectorized_text = vect_model.transform([title_])

                prediction = nb_model.predict(vectorized_text)

                prediction_bool = True if prediction[0] == 1 else False

            except Exception as e:
                print(f"Prediction failed for " f"'{title_}': {e}")
                continue

            # ------------------------------------------------
            # Get article image
            # ------------------------------------------------

            img_url_ = scrap_img_from_web(web_url_)

            # ------------------------------------------------
            # Save article
            # ------------------------------------------------

            news_article = LiveNews(
                title=title_,
                publication_date=publication_date_,
                news_category=category_,
                prediction=prediction_bool,
                section_id=section_id_,
                section_name=section_name_,
                type=type_,
                web_url=web_url_,
                img_url=img_url_,
            )

            news_article.save()

            print(f"Saved article: {title_}")

        except Exception as e:
            # Prevent one bad article from stopping
            # the processing of all other articles.
            print(f"Failed to process article: {e}")

            continue


# ============================================================
# AUTO REFRESH THREAD
# ============================================================


def auto_refresh_news():
    """
    Automatically fetch new Guardian articles every 10 seconds.
    """

    interval = 10

    while True:

        try:
            print("\n========================================")
            print("News refresh started...")
            print("========================================")

            get_new_news_from_api_and_update()

            print("News refresh completed.")

        except Exception as e:
            # IMPORTANT:
            # Prevent the background thread from dying.
            print(f"Auto refresh failed: {e}")

        print(f"Waiting {interval} seconds...")

        time.sleep(interval)


# ============================================================
# START BACKGROUND THREAD
# ============================================================

auto_refresh_thread = threading.Thread(
    target=auto_refresh_news,
    daemon=True,
)

auto_refresh_thread.start()


# ============================================================
# LIVE NEWS VIEWSET
# ============================================================


class LiveNewsPrediction(viewsets.ViewSet):

    http_method_names = (
        "get",
        "post",
    )

    def list(self, request):
        """
        GET:
        Return the latest 10 news articles.
        """

        all_live_news = LiveNews.objects.all().order_by("-id")[:10]

        serializer = LiveNewsDetailedSerializer(
            all_live_news,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def retrieve(self, request, pk=None):
        """
        GET:
        Return one specific news article.
        """

        try:
            news_prediction = LiveNews.objects.get(pk=pk)

        except LiveNews.DoesNotExist:

            return Response(
                {"error": "News not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = LiveNewsDetailedSerializer(news_prediction)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


# ============================================================
# LIVE NEWS BY CATEGORY
# ============================================================


class LiveNewsByCategory(viewsets.ViewSet):

    def list(self, request, category=None):
        """
        GET:
        Return the latest 10 news articles
        belonging to a specific category.
        """

        if category is None:

            return Response(
                {"error": "Category not provided in the URL"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        live_news = LiveNews.objects.filter(news_category=category).order_by("-id")[:10]

        serializer = LiveNewsDetailedSerializer(
            live_news,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )
