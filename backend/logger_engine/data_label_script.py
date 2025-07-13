import numpy as np
import json
import matplotlib.pyplot as plt
import os

# === CONFIG ===
INPUT_NPY = "./logger_engine/data/pose_np/sldl_israel_npy.npy"
USE_RIGHT_SIDE = True  # or False for left side
THRESHOLD = 1        # for angle change per frame

# === Auto-generate output path ===
base_name = os.path.basename(INPUT_NPY).replace("_npy.npy", "")
OUTPUT_JSON = f"./logger_engine/data/label_data/{base_name}_data.json"

# === LOAD POSE DATA ===
landmarks = np.load(INPUT_NPY)  # shape: [frames, 33, 3]


# === ANGLE FUNCTION ===
def calculate_angle(a, b, c):
    ba = a - b
    bc = c - b
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    return np.degrees(np.arccos(np.clip(cosine_angle, -1.0, 1.0)))

# === GET HIP ANGLES ===
def get_hip_angles(landmarks, right=True):
    shoulder = 12 if right else 11
    hip = 24 if right else 23
    knee = 26 if right else 25
    angles = []
    for frame in landmarks:
        # reshape to [33, 4] for (x, y, z, visibility)
        reshaped = frame.reshape(33, 4)
        a = reshaped[shoulder][:2]  # shoulder
        b = reshaped[hip][:2]       # hip
        c = reshaped[knee][:2]      # knee
        angle = calculate_angle(a, b, c)
        angles.append(angle)
    return np.array(angles)


# === LABEL STAGES ===
def label_rep_stages(angles, threshold=1):
    labels = []
    for i in range(1, len(angles)):
        delta = angles[i] - angles[i-1]
        if delta > threshold:
            labels.append("concentric")
        elif delta < -threshold:
            labels.append("eccentric")
        else:
            labels.append("none")
    labels.insert(0, "none")
    return labels

# === SAVE LABELS ===
def save_labels(labels, output_file):
    with open(output_file, "w") as f:
        json.dump({"rep_stages": labels}, f, indent=2)

# === PLOT (Optional Debug) ===
def plot_labels(angles, labels):
    colors = {"eccentric": "blue", "concentric": "red", "none": "gray"}
    plt.figure(figsize=(10, 4))
    for i, a in enumerate(angles):
        plt.scatter(i, a, color=colors[labels[i]], s=10)
    plt.plot(angles, alpha=0.3, color='black')
    plt.title("Hip Angle Over Time with Rep Stage Labels")
    plt.xlabel("Frame")
    plt.ylabel("Angle (deg)")
    plt.show()

def smooth_angles(angles, window=5):
    return np.convolve(angles, np.ones(window)/window, mode='same')

# === RUN ===
print("Processing video...")
angles = get_hip_angles(landmarks, right=USE_RIGHT_SIDE)
smoothed_angles = smooth_angles(angles)
labels = label_rep_stages(smoothed_angles, threshold=THRESHOLD)
save_labels(labels, OUTPUT_JSON)
print("Saved labels to", OUTPUT_JSON)
plot_labels(angles, labels)  # optional
print("Done.")
