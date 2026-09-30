import React, { useCallback, useEffect, useState } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import Header from './header';
import { Check2, X, Clock, ArrowUpRight } from 'react-bootstrap-icons';
import Axios from 'axios';
// import './home.css';

const API_URL = 'http://127.0.0.1:8000/api';

const categories = ['Sport', 'Lifestyle', 'Arts', 'News'];

function Home() {
  document.title = 'News Guardian | Home';

  const [liveNewsData, setLiveNewsData] = useState([]);
  const [mustSeeNews, setMustSeeNews] = useState([]);
  const [allNews, setAllNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLiveNewsData = useCallback(async () => {
    try {
      const liveRequest = Axios.get(`${API_URL}/live/`);
      const mustSeeRequest = Axios.get(`${API_URL}/category/News/`);

      const categoryRequests = categories.map((category) =>
        Axios.get(`${API_URL}/category/${category}/`),
      );

      const [liveResponse, mustSeeResponse, ...categoryResponses] =
        await Promise.all([liveRequest, mustSeeRequest, ...categoryRequests]);

      setLiveNewsData(liveResponse.data || []);
      setMustSeeNews(mustSeeResponse.data || []);

      const categoryNews = categoryResponses
        .map((response) => {
          if (response.data && response.data.length > 0) {
            return response.data[0];
          }

          return null;
        })
        .filter(Boolean);

      setAllNews(categoryNews);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveNewsData();

    const intervalId = setInterval(() => {
      fetchLiveNewsData();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [fetchLiveNewsData]);

  const formatDate = (date) => {
    if (!date) return 'Unknown date';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Unknown date';
    }

    return parsedDate.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getImage = (news) => {
    if (!news?.img_url || news.img_url === 'None') {
      return null;
    }

    return news.img_url;
  };

  const PredictionBadge = ({ prediction }) => {
    return prediction ? (
      <span className='prediction-badge prediction-real'>
        <Check2 />
        Real News
      </span>
    ) : (
      <span className='prediction-badge prediction-fake'>
        <X />
        Fake News
      </span>
    );
  };

  const NewsMeta = ({ news }) => (
    <div className='news-meta'>
      <span>
        <Clock />
        {formatDate(news.publication_date)}
      </span>

      <PredictionBadge prediction={news.prediction} />
    </div>
  );

  const NewsCard = ({ news, featured = false }) => {
    const image = getImage(news);

    return (
      <article className={`news-card ${featured ? 'featured-card' : ''}`}>
        {image ? (
          <div className='news-card-image-wrapper'>
            <img
              src={image}
              className='news-card-image'
              alt={news.title || 'News'}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />

            {featured && (
              <div className='featured-label'>
                <span></span>
                Featured
              </div>
            )}
          </div>
        ) : (
          <div className='news-card-no-image'>
            <span>NEWS</span>
          </div>
        )}

        <div className='news-card-body'>
          <h3 className='news-card-title'>{news.title}</h3>

          <NewsMeta news={news} />

          <div className='read-more'>
            Read story
            <ArrowUpRight />
          </div>
        </div>
      </article>
    );
  };

  const SectionTitle = ({ title, subtitle }) => (
    <div className='section-header'>
      <div>
        <div className='section-kicker'>NEWS GUARDIAN</div>
        <h2>{title}</h2>

        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className='section-line'></div>
    </div>
  );

  return (
    <>
      <Header activeContainer={1} />

      <main className='home-page'>
        {/* HERO / LIVE NEWS */}
        <section className='live-section'>
          <Container>
            <div className='live-header'>
              <div className='live-indicator'>
                <span className='live-dot'></span>
                LIVE
              </div>

              <span className='live-header-text'>
                Breaking news &amp; latest updates
              </span>
            </div>

            {loading ? (
              <div className='loading-container'>
                <Spinner animation='border' />
                <span>Loading latest news...</span>
              </div>
            ) : liveNewsData.length >= 10 ? (
              <>
                {/* Main featured news */}
                <Row className='g-4'>
                  <Col lg={8}>
                    <NewsCard news={liveNewsData[0]} featured />
                  </Col>

                  <Col lg={4}>
                    <div className='side-feature'>
                      {getImage(liveNewsData[1]) ? (
                        <img
                          src={getImage(liveNewsData[1])}
                          alt={liveNewsData[1].title}
                        />
                      ) : (
                        <div className='side-feature-placeholder'>NEWS</div>
                      )}

                      <div className='side-feature-overlay'>
                        <div className='side-category'>LATEST</div>

                        <h2>{liveNewsData[1].title}</h2>

                        <NewsMeta news={liveNewsData[1]} />
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* Live news grid */}
                <div className='live-grid'>
                  {liveNewsData.slice(2, 6).map((news, index) => (
                    <NewsCard key={news.id || index} news={news} />
                  ))}
                </div>
              </>
            ) : (
              <div className='empty-state'>
                <h3>Not enough data to display</h3>
                <p>We're waiting for more live news updates.</p>
              </div>
            )}
          </Container>
        </section>

        {/* MUST SEE */}
        <section className='content-section'>
          <Container>
            <SectionTitle
              title='Must See'
              subtitle='Stories you should not miss'
            />

            {mustSeeNews.length >= 4 ? (
              <Row className='g-4'>
                {mustSeeNews.slice(0, 4).map((news, index) => (
                  <Col key={news.id || index} xs={12} sm={6} lg={3}>
                    <NewsCard news={news} />
                  </Col>
                ))}
              </Row>
            ) : (
              <div className='empty-state'>Not enough data to display.</div>
            )}
          </Container>
        </section>

        {/* ALL NEWS */}
        <section className='content-section all-news-section'>
          <Container>
            <SectionTitle
              title='All News'
              subtitle='Latest stories from across our categories'
            />

            {allNews.length >= 4 ? (
              <Row className='g-4'>
                {allNews.slice(0, 4).map((news, index) => (
                  <Col key={news.id || index} xs={12} sm={6} lg={3}>
                    <NewsCard news={news} />
                  </Col>
                ))}
              </Row>
            ) : (
              <div className='empty-state'>Not enough data to display.</div>
            )}
          </Container>
        </section>
      </main>
    </>
  );
}

export default Home;
