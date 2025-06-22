import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { CosmicCursor } from "@/components/cosmic-cursor";
import Home from "@/pages/home";
import Gallery from "@/pages/gallery";
import ISSTracker from "@/pages/iss-tracker";
import SolarSystem from "@/pages/solar-system";
import Aurora from "@/pages/aurora";
import Asteroids from "@/pages/asteroids";
import Missions from "@/pages/missions";
import SpaceNews from "@/pages/space-news";
import SpaceSounds from "@/pages/space-sounds";
import SpaceWeather from "@/pages/space-weather";
import VirtualTelescope from "@/pages/virtual-telescope";
import CosmicEvents from "@/pages/cosmic-events";
import MarsRover from "@/pages/mars-rover";
import ConstellationStoryteller from "@/pages/constellation-storyteller";
import SatelliteTracker from "@/pages/satellite-tracker";
// Temporarily comment out problematic import
// import HinduPanchang from "@/pages/hindu-panchang-simple";
import NotFound from "@/pages/404";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/iss-tracker" component={ISSTracker} />
      <Route path="/solar-system" component={SolarSystem} />
      <Route path="/aurora" component={Aurora} />
      <Route path="/asteroids" component={Asteroids} />
      <Route path="/missions" component={Missions} />
      <Route path="/news" component={SpaceNews} />
      <Route path="/sounds" component={SpaceSounds} />
      <Route path="/space-weather" component={SpaceWeather} />
      <Route path="/telescope" component={VirtualTelescope} />
      <Route path="/events" component={CosmicEvents} />
      <Route path="/mars-rover" component={MarsRover} />
      <Route path="/constellations" component={ConstellationStoryteller} />
      <Route path="/constellation-storyteller" component={ConstellationStoryteller} />
      <Route path="/satellite-tracker" component={SatelliteTracker} />
      <Route path="/satellites" component={SatelliteTracker} />
      {/* <Route path="/panchang" component={HinduPanchang} /> */}
      <Route path="/panchang" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-black">
        <CosmicCursor />
        <Toaster />
        <Router />
      </div>
    </QueryClientProvider>
  );
}

export default App;
