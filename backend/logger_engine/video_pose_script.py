import cv2
import mediapipe as mp
import json
import numpy as np
import os

# === Setup ===
video_path = "./logger_engine/data/pose_video/sldl_israel.MOV" 

# Extract base name without extension
video_filename = os.path.basename(video_path)                  # your_video.mp4
video_name = os.path.splitext(video_filename)[0]              # your_video
output_json_path = f"./logger_engine/data/pose_json/{video_name}_raw_pose_data.json"
output_npy_path = f"./logger_engine/data/pose_np/{video_name}_pose_data.npy"

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=False, min_detection_confidence=0.5, min_tracking_confidence=0.5)

# Open video file
cap = cv2.VideoCapture(video_path)

pose_data = []
flat_landmark_data = []
frame_idx = 0

# === Process Video Frame-by-Frame ===
while cap.isOpened():
    ret, frame = cap.read()
    print("Frame read: ", ret)
    if not ret:
        break

    # Convert frame to RGB
    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    image.flags.writeable = False

    # Get pose landmarks
    results = pose.process(image)

    if results.pose_landmarks:
        landmarks = results.pose_landmarks.landmark

        # Save detailed JSON format
        frame_pose = {
            "frame_id": frame_idx,
            "landmarks": [
                {
                    "x": lm.x,
                    "y": lm.y,
                    "z": lm.z,
                    "visibility": lm.visibility
                } for lm in landmarks
            ]
        }
        pose_data.append(frame_pose)

        # Save flattened numpy-friendly format
        flat = []
        for lm in landmarks:
            flat.extend([lm.x, lm.y, lm.z, lm.visibility])
        flat_landmark_data.append(flat)

    frame_idx += 1
    print("Frame processed: ", frame_idx)

# === Cleanup ===
cap.release()

# === Save as JSON ===
with open(output_json_path, "w") as f:
    json.dump(pose_data, f, indent=2)
print(f"Saved pose data to {output_json_path} ({len(pose_data)} frames)")

# === Save as NumPy ===
np_array = np.array(flat_landmark_data)
np.save(output_npy_path, np_array)
print(f"Saved pose array to {output_npy_path} with shape {np_array.shape}")
