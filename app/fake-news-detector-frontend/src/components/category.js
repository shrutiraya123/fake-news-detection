import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import {
  Check2,
  X,
  Clock,
  ArrowUpRight,
  Newspaper,
} from 'react-bootstrap-icons';
import { ToastContainer, toast } from 'react-toastify';
import Axios from 'axios';

import Header from './header';

const API_URL = 'http://127.0.0.1:8000/api';

const CategoryContainer = () => {
  const { category } = useParams();

  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryName = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : '';

  useEffect(() => {
    const fetchNewsData = async () => {
      setLoading(true);

      try {
        const response = await Axios.get(
          `${API_URL}/category/${categoryName}/`,
        );

        const data = response.data || [];

        setNewsData(data);

        if (data.length < 10) {
          toast.info(
            `Only ${data.length} ${data.length === 1 ? 'story' : 'stories'} available in this category.`,
          );
        }
      } catch (error) {
        console.error('Error fetching category:', error);

        setNewsData([]);

        toast.error('Unable to load news for this category.');
      } finally {
        setLoading(false);
      }
    };

    if (categoryName) {
      fetchNewsData();
    }
  }, [categoryName]);

  const formatDate = (date) => {
    if (!date) {
      return 'Unknown date';
    }

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
    if (!news || !news.img_url || news.img_url === 'None') {
      return null;
    }

    return news.img_url;
  };

  const PredictionBadge = ({ prediction }) => {
    if (prediction === true) {
      return (
        <span className='prediction-badge prediction-real'>
          <Check2 />
          Real News
        </span>
      );
    }

    return (
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
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />

            {featured && (
              <div className='featured-label'>
                <span></span>
                Featured Story
              </div>
            )}
          </div>
        ) : (
          <div className='news-card-no-image'>
            <Newspaper />
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

  if (loading) {
    return (
      <>
        <Header activeContainer={1} />

        <main className='category-page'>
          <Container>
            <div className='category-loading'>
              <Spinner animation='border' />
              <h3>Loading {categoryName} news...</h3>
              <p>Please wait while we fetch the latest stories.</p>
            </div>
          </Container>
        </main>

        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <Header activeContainer={1} />

      <main className='category-page'>
        <Container>
          {/* CATEGORY HEADER */}
          <section className='category-heading'>
            <div className='category-heading-icon'>
              <Newspaper />
            </div>

            <div>
              <div className='category-kicker'>NEWS CATEGORY</div>

              <h1>{categoryName}</h1>

              <p>Latest stories, updates and analysis from {categoryName}.</p>
            </div>
          </section>

          {newsData.length === 0 ? (
            <div className='category-empty'>
              <div className='category-empty-icon'>
                <Newspaper />
              </div>

              <h2>No news available</h2>

              <p>There are currently no stories available for this category.</p>
            </div>
          ) : (
            <>
              {/* FEATURED STORIES */}
              <section className='category-featured'>
                <div className='category-section-title'>
                  <div>
                    <span>TOP STORIES</span>
                    <h2>Latest from {categoryName}</h2>
                  </div>

                  <div className='category-title-line'></div>
                </div>

                <Row className='g-4'>
                  {/* FIRST STORY */}
                  <Col lg={8}>
                    <NewsCard news={newsData[0]} featured />
                  </Col>

                  {/* SECOND STORY */}
                  {newsData.length > 1 && (
                    <Col lg={4}>
                      <article className='category-side-story'>
                        {getImage(newsData[1]) ? (
                          <div className='category-side-image'>
                            <img
                              src={getImage(newsData[1])}
                              alt={newsData[1].title}
                            />
                          </div>
                        ) : (
                          <div className='category-side-image category-side-placeholder'>
                            <Newspaper />
                          </div>
                        )}

                        <div className='category-side-body'>
                          <span className='story-label'>LATEST</span>

                          <h3>{newsData[1].title}</h3>

                          <NewsMeta news={newsData[1]} />
                        </div>
                      </article>
                    </Col>
                  )}
                </Row>
              </section>

              {/* REST OF NEWS */}
              {newsData.length > 2 && (
                <section className='category-news-list'>
                  <div className='category-section-title'>
                    <div>
                      <span>MORE STORIES</span>
                      <h2>More from {categoryName}</h2>
                    </div>

                    <div className='category-title-line'></div>
                  </div>

                  <Row className='g-4'>
                    {newsData.slice(2).map((news, index) => (
                      <Col key={news.id || index} xs={12} sm={6} lg={3}>
                        <NewsCard news={news} />
                      </Col>
                    ))}
                  </Row>
                </section>
              )}
            </>
          )}
        </Container>
      </main>

      <ToastContainer />
    </>
  );
};

export default CategoryContainer;
