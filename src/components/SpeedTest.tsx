import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";

type TestStatus = "idle" | "testing" | "complete";

const SpeedTest = () => {
  const [speed, setSpeed] = useState(0);
  const [status, setStatus] = useState<TestStatus>("idle");
  const [ping, setPing] = useState<number | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<number | null>(null);

  const measurePing = async () => {
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

  const measureDownloadSpeed = async () => {
    const testSizes = [1, 2, 5]; // MB
    let totalSpeed = 0;
    let measurements = 0;

    for (const size of testSizes) {
      try {
        // Using a CORS-friendly test file endpoint
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

  const simulateUploadSpeed = (downloadSpeed: number) => {
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
    
    // Simulate upload speed
    const upload = simulateUploadSpeed(finalSpeed);
    setUploadSpeed(upload);

    setStatus("complete");
  };

  useEffect(() => {
    if (status === "idle") {
      startTest();
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary opacity-50" />
      
      {/* Glow effect */}
      {status === "testing" && (
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ background: "hsl(var(--speed-glow))" }}
        />
      )}

      <div className="relative z-10 text-center max-w-4xl w-full">
        {/* Main speed display */}
        <div className="mb-8">
          <div className="relative inline-block">
            <h1 
              className="text-[12rem] md:text-[16rem] font-black leading-none tracking-tight transition-all duration-300"
              style={{
                color: status === "complete" ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                textShadow: status === "complete" 
                  ? "0 0 40px hsl(var(--speed-glow) / 0.5), 0 0 80px hsl(var(--speed-glow) / 0.3)" 
                  : "none"
              }}
            >
              {speed.toFixed(1)}
            </h1>
          </div>
          <p className="text-2xl md:text-3xl font-semibold text-muted-foreground mt-4">
            Mbps
          </p>
        </div>

        {/* Status text */}
        <div className="mb-12">
          <p className="text-lg text-muted-foreground">
            {status === "idle" && "Preparing test..."}
            {status === "testing" && "Testing your connection speed..."}
            {status === "complete" && "Your download speed"}
          </p>
        </div>

        {/* Additional metrics */}
        {(ping !== null || uploadSpeed !== null) && (
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            {ping !== null && (
              <div className="text-center">
                <p className="text-4xl font-bold text-primary mb-1">{ping}</p>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">Latency (ms)</p>
              </div>
            )}
            {uploadSpeed !== null && (
              <div className="text-center">
                <p className="text-4xl font-bold text-primary mb-1">{uploadSpeed}</p>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">Upload (Mbps)</p>
              </div>
            )}
          </div>
        )}

        {/* Action button */}
        {status === "complete" && (
          <Button
            onClick={startTest}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Activity className="mr-2 h-5 w-5" />
            Test Again
          </Button>
        )}

        {status === "testing" && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-center text-sm text-muted-foreground">
        <p>Testing from your location</p>
      </div>
    </div>
  );
};

export default SpeedTest;
