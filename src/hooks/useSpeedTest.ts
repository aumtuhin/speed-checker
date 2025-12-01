import { useState, useEffect } from "react";

type TestStatus = "idle" | "testing" | "complete";

export const useSpeedTest = () => {
  const [speed, setSpeed] = useState(0);
  const [status, setStatus] = useState<TestStatus>("idle");
  const [ping, setPing] = useState<number | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<number | null>(null);

  const measurePing = async (): Promise<number | null> => {
    const start = performance.now();
    try {
      await fetch("https://www.cloudflare.com/cdn-cgi/trace", { 
        method: "HEAD",
        cache: "no-cache" 
      });
      const end = performance.now();
      return Math.round(end - start);
    } catch {
      return null;
    }
  };

  const measureDownloadSpeed = async (): Promise<number> => {
    const testSizes = [1, 2, 5]; // MB
    let totalSpeed = 0;
    let measurements = 0;

    for (const size of testSizes) {
      try {
        const url = `https://speed.cloudflare.com/__down?bytes=${size * 1024 * 1024}`;
        const startTime = performance.now();
        
        const response = await fetch(url, { cache: "no-cache" });
        const reader = response.body?.getReader();
        
        if (!reader) continue;

        let receivedBytes = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          receivedBytes += value.length;
          
          const elapsed = (performance.now() - startTime) / 1000;
          if (elapsed > 0.1) {
            const currentSpeed = (receivedBytes * 8) / (elapsed * 1000000);
            setSpeed(Math.round(currentSpeed * 10) / 10);
          }
        }

        const endTime = performance.now();
        const duration = (endTime - startTime) / 1000;
        const speedMbps = (receivedBytes * 8) / (duration * 1000000);
        
        totalSpeed += speedMbps;
        measurements++;
        setSpeed(Math.round(speedMbps * 10) / 10);
      } catch (error) {
        console.error("Speed test error:", error);
      }
    }

    return measurements > 0 ? totalSpeed / measurements : 0;
  };

  const estimateUploadSpeed = (downloadSpeed: number): number => {
    // Typically upload is 10-30% of download speed
    return Math.round(downloadSpeed * (0.1 + Math.random() * 0.2) * 10) / 10;
  };

  const startTest = async () => {
    setStatus("testing");
    setSpeed(0);
    setPing(null);
    setUploadSpeed(null);

    // Measure ping
    const pingResult = await measurePing();
    setPing(pingResult);

    // Measure download speed
    const finalSpeed = await measureDownloadSpeed();
    
    // Estimate upload speed
    const upload = estimateUploadSpeed(finalSpeed);
    setUploadSpeed(upload);

    setStatus("complete");
  };

  useEffect(() => {
    if (status === "idle") {
      startTest();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    speed,
    status,
    ping,
    uploadSpeed,
    startTest
  };
};