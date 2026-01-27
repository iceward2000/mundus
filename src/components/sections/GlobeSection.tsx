"use client";

import GlobeViz from "../GlobeViz";
import SectionWrapper from "../SectionWrapper";

// 30+ Country Markers
const MARKERS = [
  // North America
  { lat: 37.0902, lng: -95.7129, label: "United States", description: "Global HQ & Tech Hub" },
  { lat: 56.1304, lng: -106.3468, label: "Canada", description: "Northern Operations" },
  { lat: 23.6345, lng: -102.5528, label: "Mexico", description: "LatAm Gateway" },
  
  // South America
  { lat: -14.2350, lng: -51.9253, label: "Brazil", description: "South American Hub" },
  { lat: -38.4161, lng: -63.6167, label: "Argentina", description: "Southern Cone Support" },
  { lat: -9.1900, lng: -75.0152, label: "Peru", description: "Andean Region" },
  { lat: 4.5709, lng: -74.2973, label: "Colombia", description: "Northern Andes" },
  { lat: -35.6751, lng: -71.5430, label: "Chile", description: "Pacific Coast" },

  // Europe
  { lat: 55.3781, lng: -3.4360, label: "United Kingdom", description: "European HQ" },
  { lat: 51.1657, lng: 10.4515, label: "Germany", description: "Central Europe Engineering" },
  { lat: 46.2276, lng: 2.2137, label: "France", description: "Western Europe Sales" },
  { lat: 41.8719, lng: 12.5674, label: "Italy", description: "Southern Europe" },
  { lat: 40.4637, lng: -3.7492, label: "Spain", description: "Iberian Peninsula" },
  { lat: 52.1326, lng: 5.2913, label: "Netherlands", description: "Logistics Hub" },
  { lat: 60.1282, lng: 18.6435, label: "Sweden", description: "Nordic Innovation" },
  { lat: 46.8182, lng: 8.2275, label: "Switzerland", description: "Finance & Strategy" },
  { lat: 51.9194, lng: 19.1451, label: "Poland", description: "Eastern Europe Support" },

  // Asia
  { lat: 36.2048, lng: 138.2529, label: "Japan", description: "APAC HQ" },
  { lat: 35.8617, lng: 104.1954, label: "China", description: "East Asia Manufacturing" },
  { lat: 20.5937, lng: 78.9629, label: "India", description: "Global Development Center" },
  { lat: 1.3521, lng: 103.8198, label: "Singapore", description: "SEA Regional Hub" },
  { lat: 35.9078, lng: 127.7669, label: "South Korea", description: "Technology Research" },
  { lat: 14.0583, lng: 108.2772, label: "Vietnam", description: "Emerging Markets" },
  { lat: 23.6978, lng: 120.9605, label: "Taiwan", description: "Hardware Engineering" },
  { lat: 39.0742, lng: 21.8243, label: "Greece", description: "Mediterranean" },
  { lat: 31.0461, lng: 34.8516, label: "Israel", description: "Cybersecurity Lab" },

  // Middle East & Africa
  { lat: 23.8859, lng: 45.0792, label: "Saudi Arabia", description: "Middle East Ops" },
  { lat: 25.2048, lng: 55.2708, label: "UAE", description: "Regional Commerce" },
  { lat: -30.5595, lng: 22.9375, label: "South Africa", description: "African HQ" },
  { lat: 30.0444, lng: 31.2357, label: "Egypt", description: "North Africa" },
  { lat: 6.5244, lng: 3.3792, label: "Nigeria", description: "West Africa" },

  // Oceania
  { lat: -25.2744, lng: 133.7751, label: "Australia", description: "Oceania HQ" },
  { lat: -40.9006, lng: 174.8860, label: "New Zealand", description: "Pacific Support" },
];

export default function GlobeSection() {
  return (
    <SectionWrapper 
      id="global-presence" 
      className="bg-slate-950 py-20 relative overflow-hidden !pr-0 md:!pr-0 lg:!pr-0 xl:!pr-0"
    >
      <div className="container mx-auto px-4 mb-10 relative z-10 pr-4 md:pr-12 lg:pr-12 xl:pr-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Connecting the World
          </h2>
          <p className="text-slate-400 text-lg">
            Our global network ensures we deliver seamless solutions wherever you are.
            Explore our active hubs across 30+ countries.
          </p>
        </div>
      </div>

      <div className="w-full h-[600px] md:h-[700px] relative z-0">
        <GlobeViz markers={MARKERS} />
      </div>
      
      {/* Interactive Hint */}
      <div className="absolute bottom-10 w-full text-center z-10 pointer-events-none">
        <p className="text-slate-500 text-sm bg-black/30 inline-block px-4 py-2 rounded-full backdrop-blur-sm">
          Drag to rotate • Click markers for details • Scroll to zoom
        </p>
      </div>
    </SectionWrapper>
  );
}
