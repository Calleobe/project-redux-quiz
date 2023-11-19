import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { quiz } from "../reducers/quiz";
import "../styles.css";

export const CurrentQuestion = () => {
  const dispatch = useDispatch();
  const currentQuestionIndex = useSelector(
    (state) => state.quiz.currentQuestionIndex
  );
  const question = useSelector(
    (state) => state.quiz.questions[currentQuestionIndex]
  );
  const totalQuestions = useSelector((state) => state.quiz.questions.length);
  const globalElapsedTime = useSelector(
    (state) => state.quiz.globalElapsedTime
  );
  const [timeUp, setTimeUp] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const timeoutRef = useRef(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAnswerSelected, setIsAnswerSelected] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(
    ((currentQuestionIndex + 1) / totalQuestions) * 100
  );

  if (!question) {
    return <h1>Oh no! I could not find the current question!</h1>;
  }

  const handleAnswer = useCallback(
    (index) => {
      const answeredIndex = index !== null ? index : -1;

      const correct = question.correctAnswerIndex === answeredIndex;
      setSelectedAnswer(answeredIndex);
      setIsAnswerCorrect(correct);
      setShowFeedback(true);
      setIsAnswerSelected(true);
      dispatch(
        quiz.actions.submitAnswer({
          questionId: question.id,
          answerIndex: answeredIndex,
          isCorrect: correct,
        })
      );

      const timeoutId = setTimeout(() => {
        dispatch(quiz.actions.goToNextQuestion());
        setShowFeedback(false);
        setSelectedAnswer(null);
        setIsAnswerCorrect(null);
        setIsAnswerSelected(false);

        setProgressPercentage(
          ((currentQuestionIndex + 2) / totalQuestions) * 100
        );

        setTimeLeft(10);
        setTimeUp(false);
      }, 2000);

      timeoutRef.current = timeoutId;
    },
    [dispatch, question, currentQuestionIndex, totalQuestions]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentQuestionIndex]);

  useEffect(() => {
    let timer;

    if (quizStarted && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft((prevTime) => prevTime - 1);

        // Dispatch updated elapsed time to Redux store
        dispatch(quiz.actions.updateElapsedTime(globalElapsedTime + 1));
      }, 1000);
    }

    if (quizStarted && timeLeft === 0) {
      if (!showFeedback) {
        handleAnswer(null);
        setTimeUp(true);
      }
    }

    return () => {
      clearTimeout(timer);
    };
  }, [
    quizStarted,
    timeLeft,
    globalElapsedTime,
    handleAnswer,
    showFeedback,
    dispatch,
  ]);

  const getButtonStyle = (index) => {
    if (selectedAnswer === index) {
      return isAnswerCorrect ? "button-correct" : "button-incorrect";
    }
    if (isAnswerCorrect === false && index === question.correctAnswerIndex) {
      return "button-correct";
    }
    return "";
  };

  const startQuiz = () => {
    setQuizStarted(true);
  };

  return (
    <div className="new-page">
      <div className="question-box">
        {quizStarted ? ( // Display the question details only if the quiz has started
          <>
            <h2>{question.questionText}</h2>
            {question.image && (
              <img
                src={question.image}
                alt="Question Image"
                className="quiz-image"
              />
            )}
            <div className="counter-time-wrapper">
              <p>
                Question {currentQuestionIndex + 1} / {totalQuestions}
              </p>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div>
              {isAnswerSelected ? (
                <div className="countdown-empty">
                  {showFeedback && (
                    <h1
                      className={`feedback ${
                        isAnswerCorrect
                          ? "correct"
                          : timeUp
                          ? "time-up"
                          : "wrong"
                      }`}
                    >
                      {isAnswerCorrect
                        ? "Correct answer"
                        : timeUp
                        ? "Time is up"
                        : "Wrong answer"}
                    </h1>
                  )}
                </div> // This is the empty div
              ) : (
                <div className="countdown">
                  <h4>{timeLeft}</h4>
                </div>
              )}
            </div>
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={getButtonStyle(index)}
                disabled={showFeedback}
              >
                {option}
              </button>
            ))}
          </>
        ) : (
          // Display the start message and button if the quiz hasn't started
          <>
            <h1 className="start-quiz-text">Geography quiz game</h1>

            <p className="start-quiz-text">Ready? Get over 5 points to win!</p>

            <button onClick={startQuiz}>Start</button>
          </>
        )}
      </div>
      <footer className="copyright">
        <p>
          Quiz project, by <a href="https://github.com/Calleobe">Carl Öberg</a>{" "}
          & <a href="https://github.com/fabio-cassisa">Fabio Cassisa</a>, 2023
        </p>
      </footer>
    </div>
  );
};
