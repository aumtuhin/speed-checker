import { useSpeedTest } from "@/hooks/useSpeedTest";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";

const SpeedTest = () => {
  const { speed, status, ping, uploadSpeed, startTest } = useSpeedTest();
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
