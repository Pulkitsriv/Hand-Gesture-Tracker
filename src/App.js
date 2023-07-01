import React, { useEffect, useRef, useState } from "react";
import HandLandMarker from "./Components/HandLandMarker";
import { DrawingUtils, HandLandmarker } from "@mediapipe/tasks-vision";

const App = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const inputVideoRef = useRef(null);
  const [character,setCharacter]=useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    const videoRef = inputVideoRef.current;

    if (canvas) {
      contextRef.current = canvas.getContext("2d");
    }

    if (contextRef.current && canvas && videoRef) {
      createHandLandmarker().then((handLandmarker) => {
        console.log(handLandmarker);
        const drawingUtils = new DrawingUtils(contextRef.current);
        let lastVideoTime = -1;
        let results = undefined;

        function predict() {
          console.log("I am the best");
          canvas.style.width = videoRef.videoWidth;
          canvas.style.height = videoRef.videoHeight;
          canvas.width = videoRef.videoWidth;
          canvas.height = videoRef.videoWidth;

          let startTimeMs = performance.now();

          if (lastVideoTime !== videoRef.currentTime) {
            lastVideoTime = videoRef.currentTime;
            results = handLandmarker.detectForVideo(videoRef, startTimeMs);
            console.log(results);
          }

          contextRef.current.save();
          contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
          if (results.landmarks) {
            for (const landmarks of results.landmarks) {
              drawingUtils.drawConnectors(
                landmarks,
                HandLandmarker.HAND_CONNECTIONS,
                {
                  color: "#00FF00",
                  lineWidth: 2,
                }
              );
              drawingUtils.drawLandmarks(landmarks, {
                color: "#FF0000",
                lineWidth: 2,
              });

              const gesture = getHandGesture(landmarks);
              console.log("Hand Gesture:", gesture);
              setCharacter(gesture);
            }
          }

          window.requestAnimationFrame(predict);
        }

        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
          videoRef.srcObject = stream;
          videoRef.addEventListener("loadeddata", predict);
        });
      });
    }
  }, []);

  const createHandLandmarker = async () => {
    const handLandmarker = await HandLandMarker();
    return handLandmarker;
  };

  
  const getHandGesture = (landmarks) => {
   
      const thumbTip = landmarks[4];
      const indexFingerTip = landmarks[8];
      const middleFingerTip = landmarks[12];
      const ringFingerTip = landmarks[16];
      const pinkyFingerTip = landmarks[20];
      
  
    
      const thumbToIndexDistance = calculateDistance(thumbTip, indexFingerTip);
      const thumbToMiddleDistance = calculateDistance(thumbTip, middleFingerTip);
      const thumbToRingDistance = calculateDistance(thumbTip, ringFingerTip);
      const thumbToPinkyDistance = calculateDistance(thumbTip, pinkyFingerTip);
     
      
      if (
        thumbToIndexDistance > 0.1 && thumbToIndexDistance <0.18 &&
        thumbToMiddleDistance > 0.1 && thumbToMiddleDistance < 0.18 &&
        thumbToRingDistance >0.06 && thumbToRingDistance<0.13 &&
        thumbToPinkyDistance > 0.1 && thumbToPinkyDistance<0.15
      ) {
        return "A";
      }
      else if (
        thumbToIndexDistance > 0.35 && thumbToIndexDistance <0.50 &&
        thumbToMiddleDistance > 0.35 && thumbToMiddleDistance < 0.50 &&
        thumbToRingDistance >0.30 && thumbToRingDistance<0.40 &&
        thumbToPinkyDistance > 0.0 && thumbToPinkyDistance<0.15
      ) {
        return "W";
      } 
     else  if (
        thumbToIndexDistance > 0.01 && thumbToIndexDistance <0.1 &&
        thumbToMiddleDistance > 0.01 && thumbToMiddleDistance < 0.1 &&
        thumbToRingDistance >0.01 && thumbToRingDistance<0.1 &&
        thumbToPinkyDistance > 0.01 && thumbToPinkyDistance<0.1
      ) {
        return "O";
      }
      else  if (
        thumbToIndexDistance > 0.30 && thumbToIndexDistance <0.40 &&
        thumbToMiddleDistance > 0.02 && thumbToMiddleDistance < 0.1 &&
        thumbToRingDistance >0.05 && thumbToRingDistance<0.15 &&
        thumbToPinkyDistance > 0.09 && thumbToPinkyDistance<0.18
      ) {
        return "I";
      }
       else if (
        thumbToIndexDistance > 0.14 && thumbToIndexDistance <0.40 &&
        thumbToMiddleDistance > 0.14 && thumbToMiddleDistance < 0.40 &&
        thumbToRingDistance >0.15 && thumbToRingDistance<0.40 &&
        thumbToPinkyDistance > 0.17 && thumbToPinkyDistance<0.40
      ) {
        return "C";
      }
      else if (
        thumbToIndexDistance > 0.25 && thumbToIndexDistance <0.48 &&
        thumbToMiddleDistance > 0.25 && thumbToMiddleDistance < 0.37 &&
        thumbToRingDistance >0.25 && thumbToRingDistance<0.37 &&
        thumbToPinkyDistance > 0.25 && thumbToPinkyDistance<0.42
      ) {
        return "L";
      }
      else if (
        thumbToIndexDistance > 0.15 &&
        thumbToMiddleDistance > 0.15 &&
        thumbToRingDistance < 0.1 &&
        thumbToPinkyDistance < 0.1
      ) {
        return "V";
      }
      return "Unknown Gesture";
    
  

    
  };
  const calculateDistance = (p1, p2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z- p1.z;
    console.log(Math.sqrt(dx * dx + dy * dy + dz * dz));
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  };

  return (
    <>
      <div style={{ position: "relative" }}>
        <h1>Hand Gesture:{character}</h1>
        <video
          id="webcam"
          style={{ position: "absolute" }}
          autoPlay
          playsInline
          ref={inputVideoRef}
        ></video>
        <canvas
          ref={canvasRef}
          id="output_canvas"
          style={{ position: "absolute", left: "0px", top: "0px" }}
        ></canvas>
      </div>
      
    </>
  );
};

export default App;