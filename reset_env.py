import os
import subprocess
import time
import sys

def kill_processes():
    print("Stopping existing uvicorn and vite processes...")
    if sys.platform == "win32":
        subprocess.run(["taskkill", "/F", "/IM", "python.exe", "/T"], capture_output=True)
        subprocess.run(["taskkill", "/F", "/IM", "node.exe", "/T"], capture_output=True)
    else:
        subprocess.run(["pkill", "-f", "uvicorn"], capture_output=True)
        subprocess.run(["pkill", "-f", "vite"], capture_output=True)
    print("Processes stopped.")

if __name__ == "__main__":
    kill_processes()
    print("\n--- Environment cleaned! ---")
    print("Now run these commands in separate terminals:")
    print("1. cd denta-server && python -m uvicorn app.main:app --port 8000 --reload")
    print("2. cd denta-web && npm run dev -- --port 5175")
