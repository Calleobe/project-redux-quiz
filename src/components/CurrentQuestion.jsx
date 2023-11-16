import { useState, useEffect, useRef } from "react";
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

  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const timeoutRef = useRef(null);
  const [globalElapsedTime, setGlobalElapsedTime] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(
    ((currentQuestionIndex + 1) / totalQuestions) * 100
  );
  

  if (!question) {
    return <h1>Oh no! I could not find the current question!</h1>;
  }

  const handleAnswer = (index) => {
    // Set a default value for unanswered questions (e.g., -1 for no answer)
    const answeredIndex = index !== null ? index : -1;
  
    const correct = question.correctAnswerIndex === answeredIndex;
    setSelectedAnswer(answeredIndex);
    setIsAnswerCorrect(correct);
    setShowFeedback(true);
  
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
  
      // Update progress percentage for the progressBar
      setProgressPercentage(
        ((currentQuestionIndex + 2) / totalQuestions) * 100
      );
  
      // Reset the timer for the next question
      setTimeLeft(10);
    }, 2000); // 2 seconds delay
  
    // Store the timeoutId in a ref to be cleared if the component unmounts or if a new question is presented
    timeoutRef.current = timeoutId;
  };
  

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
        setGlobalElapsedTime((prevElapsedTime) => prevElapsedTime + 1);
      }, 1000);
    }
  
    // Handle the case where the quiz has started, but the time has run out
    if (quizStarted && timeLeft === 0) {
      if (!showFeedback) {
        // Only submit the answer if feedback is not already shown
        handleAnswer(null);
      }
    }
  
    return () => {
      clearTimeout(timer);
    };
  }, [quizStarted, timeLeft, handleAnswer, showFeedback]);
  
  

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
              <p>
                Time left: {timeLeft}s (Local) | Total time:{" "}
                {globalElapsedTime}s (Global)
              </p>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            {showFeedback && (
              <p>{isAnswerCorrect ? "Correct answer" : "Wrong answer"}</p>
            )}
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
            <h2>Ready to take this quiz?</h2>
            <button onClick={startQuiz}>Start</button>
          </>
        )}
      </div>
    </div>
  );
};
