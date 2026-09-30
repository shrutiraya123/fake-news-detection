import React, { useState, useEffect } from 'react';
import Header from './header';
import Axios from 'axios';
import { Container, Button, Spinner } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import {
  Check2,
  X,
  ArrowRight,
  ArrowClockwise,
  QuestionCircle,
  ShieldCheck,
} from 'react-bootstrap-icons';

function NewsQuiz() {
  document.title = 'News Guardian | News Quiz';

  const quizData = {
    id: null,
    news_title: '',
    news_description: '',
    label: null,
  };

  const [newsForQuiz, setNewsForQuiz] = useState(quizData);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    fetchQuizData();
  }, []);

  const fetchQuizData = () => {
    setIsLoading(true);
    setAnswerChecked(false);
    setIsCorrect(null);
    setSelectedAnswer('');

    Axios.get('http://127.0.0.1:8000/api/quiz/')
      .then((response) => {
        setNewsForQuiz(response.data);
      })
      .catch((error) => {
        console.error('Error:', error);
        toast.error('Unable to load a quiz right now.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleOptionChange = (event) => {
    if (answerChecked) return;

    setSelectedAnswer(event.target.value);
  };

  const checkAnswer = () => {
    if (!selectedAnswer) {
      toast.error('Please select an answer!');
      return;
    }

    const correct =
      (newsForQuiz.label === true && selectedAnswer === 'True') ||
      (newsForQuiz.label === false && selectedAnswer === 'False');

    setIsCorrect(correct);
    setAnswerChecked(true);

    if (correct) {
      toast.success('Correct! Great prediction.');
    } else {
      toast.warn("That's not correct. Try the next story!");
    }
  };

  const getNewQuiz = () => {
    fetchQuizData();
  };

  const getOptionClass = (option) => {
    if (!answerChecked) {
      return selectedAnswer === option ? 'quiz-option selected' : 'quiz-option';
    }

    const isCorrectOption =
      (newsForQuiz.label === true && option === 'True') ||
      (newsForQuiz.label === false && option === 'False');

    if (isCorrectOption) {
      return 'quiz-option correct';
    }

    if (selectedAnswer === option && !isCorrect) {
      return 'quiz-option incorrect';
    }

    return 'quiz-option disabled';
  };

  if (isLoading) {
    return (
      <>
        <Header activeContainer={3} />

        <main className='quiz-page'>
          <Container>
            <div className='quiz-loading'>
              <div className='quiz-loading-icon'>
                <QuestionCircle />
              </div>

              <Spinner animation='border' />

              <h3>Loading your quiz...</h3>

              <p>Finding a news story for you to analyze.</p>
            </div>
          </Container>
        </main>

        <ToastContainer
          position='bottom-right'
          autoClose={3500}
          theme='colored'
        />
      </>
    );
  }

  return (
    <>
      <Header activeContainer={3} />

      <main className='quiz-page'>
        <Container>
          {/* HERO */}
          <section className='quiz-hero'>
            <div className='quiz-hero-icon'>
              <QuestionCircle />
            </div>

            <div className='quiz-kicker'>TEST YOUR KNOWLEDGE</div>

            <h1>
              News
              <span> Quiz</span>
            </h1>

            <p>
              Can you tell real news from fake news? Read the story and make
              your prediction.
            </p>
          </section>

          {/* QUIZ CARD */}
          <section className='quiz-card'>
            <div className='quiz-card-top'>
              <div className='quiz-number'>
                <span>QUIZ</span>
                <strong>01</strong>
              </div>

              <div className='quiz-category'>
                <ShieldCheck />
                News Guardian
              </div>
            </div>

            {/* QUESTION */}
            <div className='quiz-question'>
              <span className='question-label'>IS THIS REAL OR FAKE?</span>

              <h2>{newsForQuiz.news_title}</h2>
            </div>

            {/* DESCRIPTION */}
            <div className='quiz-description'>
              <p>{newsForQuiz.news_description}</p>
            </div>

            {/* ANSWERS */}
            <div className='quiz-answers'>
              <p className='answers-label'>Choose your prediction</p>

              {/* REAL NEWS */}
              <button
                type='button'
                className={getOptionClass('True')}
                onClick={() => !answerChecked && setSelectedAnswer('True')}
                disabled={answerChecked}
              >
                <div className='option-left'>
                  <div className='option-radio'>
                    {selectedAnswer === 'True' && (
                      <div className='option-radio-dot' />
                    )}
                  </div>

                  <div className='option-icon real'>
                    <Check2 />
                  </div>

                  <div className='option-text'>
                    <strong>Real News</strong>
                    <span>This story appears to be genuine</span>
                  </div>
                </div>

                {answerChecked && newsForQuiz.label === true && (
                  <Check2 className='answer-result-icon' />
                )}

                {answerChecked &&
                  selectedAnswer === 'True' &&
                  newsForQuiz.label === false && (
                    <X className='answer-result-icon' />
                  )}
              </button>

              {/* FAKE NEWS */}
              <button
                type='button'
                className={getOptionClass('False')}
                onClick={() => !answerChecked && setSelectedAnswer('False')}
                disabled={answerChecked}
              >
                <div className='option-left'>
                  <div className='option-radio'>
                    {selectedAnswer === 'False' && (
                      <div className='option-radio-dot' />
                    )}
                  </div>

                  <div className='option-icon fake'>
                    <X />
                  </div>

                  <div className='option-text'>
                    <strong>Fake News</strong>
                    <span>This story appears to be misleading</span>
                  </div>
                </div>

                {answerChecked && newsForQuiz.label === false && (
                  <Check2 className='answer-result-icon' />
                )}

                {answerChecked &&
                  selectedAnswer === 'False' &&
                  newsForQuiz.label === true && (
                    <X className='answer-result-icon' />
                  )}
              </button>
            </div>

            {/* RESULT */}
            {answerChecked && (
              <div
                className={`quiz-result ${
                  isCorrect ? 'quiz-result-correct' : 'quiz-result-incorrect'
                }`}
              >
                <div className='quiz-result-icon'>
                  {isCorrect ? <Check2 /> : <X />}
                </div>

                <div>
                  <strong>
                    {isCorrect ? 'Correct prediction!' : 'Not quite!'}
                  </strong>

                  <span>
                    {isCorrect
                      ? 'You correctly identified the news classification.'
                      : `The correct answer is ${
                          newsForQuiz.label ? 'Real News' : 'Fake News'
                        }.`}
                  </span>
                </div>
              </div>
            )}

            {/* ACTIONS */}
            <div className='quiz-actions'>
              {!answerChecked ? (
                <Button className='quiz-check-button' onClick={checkAnswer}>
                  Check Answer
                  <ArrowRight />
                </Button>
              ) : (
                <Button className='quiz-new-button' onClick={getNewQuiz}>
                  <ArrowClockwise />
                  Get New Quiz
                </Button>
              )}
            </div>

            <div className='quiz-footer'>
              <ShieldCheck />
              <span>Powered by the News Guardian prediction system</span>
            </div>
          </section>
        </Container>
      </main>

      <ToastContainer
        position='bottom-right'
        autoClose={3500}
        theme='colored'
      />
    </>
  );
}

export default NewsQuiz;
