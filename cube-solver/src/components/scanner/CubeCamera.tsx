"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

export interface CubeCameraHandle {
  captureFrame: () => string | null;
}

interface CubeCameraProps {
  active: boolean;
  onError: (message: string) => void;
}

const CubeCamera = forwardRef<
  CubeCameraHandle,
  CubeCameraProps
>(({ active, onError }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /*
   * --------------------------------
   * CAPTURE FRAME
   * --------------------------------
   *
   * The ScannerGrid represents the
   * centered 55% square of the camera.
   *
   * We capture exactly that same
   * centered square from the video.
   */
  useImperativeHandle(
    ref,
    () => ({
      captureFrame() {
        const video = videoRef.current;

        if (!video) {
          onError("Camera element is not available.");
          return null;
        }

        if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
          onError("Camera is not ready yet.");
          return null;
        }

        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        if (!videoWidth || !videoHeight) {
          onError("Unable to read the camera frame.");
          return null;
        }

        /*
         * Use the smaller video dimension so
         * that we always get a square crop.
         */
        const baseSize = Math.min(
          videoWidth,
          videoHeight
        );

        /*
         * ScannerGrid uses 55% of the
         * available centered square.
         */
        const size = baseSize * 0.55;

        const sourceX =
          (videoWidth - size) / 2;

        const sourceY =
          (videoHeight - size) / 2;

        /*
         * Output resolution.
         *
         * 900x900 is more than enough for
         * 3x3 color detection.
         */
        const outputSize = 900;

        const canvas =
          document.createElement("canvas");

        canvas.width = outputSize;
        canvas.height = outputSize;

        const context =
          canvas.getContext("2d", {
            willReadFrequently: true,
          });

        if (!context) {
          onError(
            "Unable to create image canvas."
          );

          return null;
        }

        /*
         * Draw only the scanner area.
         */
        context.drawImage(
          video,
          sourceX,
          sourceY,
          size,
          size,
          0,
          0,
          outputSize,
          outputSize
        );

        /*
         * JPEG provides a good balance between
         * image quality and processing speed.
         */
        return canvas.toDataURL(
          "image/jpeg",
          0.92
        );
      },
    }),
    [onError]
  );

  /*
   * --------------------------------
   * CAMERA START / STOP
   * --------------------------------
   */
  useEffect(() => {
    if (!active) {
      return;
    }

    let mounted = true;

    const startCamera = async () => {
      try {
        /*
         * Browser support check.
         */
        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices.getUserMedia
        ) {
          onError(
            "Your browser does not support camera access."
          );

          return;
        }

        /*
         * Request rear camera when available.
         */
        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: {
                ideal: "environment",
              },
              width: {
                ideal: 1280,
              },
              height: {
                ideal: 720,
              },
            },
            audio: false,
          });

        /*
         * Component may have unmounted while
         * camera permission was being requested.
         */
        if (!mounted) {
          stream
            .getTracks()
            .forEach((track) => track.stop());

          return;
        }

        streamRef.current = stream;

        const video = videoRef.current;

        if (!video) {
          stream
            .getTracks()
            .forEach((track) => track.stop());

          streamRef.current = null;

          onError(
            "Unable to initialize the camera."
          );

          return;
        }

        /*
         * Attach camera stream.
         */
        video.srcObject = stream;

        /*
         * Wait until the browser can play
         * the camera stream.
         */
        await video.play();
      } catch (error) {
        console.error(
          "Camera initialization error:",
          error
        );

        if (!mounted) {
          return;
        }

        /*
         * Stop any partially-created stream.
         */
        streamRef.current
          ?.getTracks()
          .forEach((track) => track.stop());

        streamRef.current = null;

        onError(
          "Unable to access the camera. Please allow camera permission."
        );
      }
    };

    startCamera();

    /*
     * Cleanup.
     *
     * This is important because camera streams
     * otherwise remain active.
     */
    return () => {
      mounted = false;

      streamRef.current
        ?.getTracks()
        .forEach((track) => {
          track.stop();
        });

      streamRef.current = null;

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [active, onError]);

  /*
   * --------------------------------
   * VIDEO
   * --------------------------------
   */
  return (
    <video
      ref={videoRef}
      muted
      playsInline
      autoPlay
      aria-label="Rubik's Cube scanning camera"
      className="h-full w-full object-cover"
    />
  );
});

CubeCamera.displayName = "CubeCamera";

export default CubeCamera;