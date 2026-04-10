import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./Sidebar";
import KPIDashboard from "./KPIDashboard";
import NetworkGraph from "./NetworkGraph";
import ScenarioBuilder from "./ScenarioBuilder";
import DataUpload from "./DataUpload";
import AIInsights from "./AIInsights";

const views = {
  dashboard: KPIDashboard,
  network: NetworkGraph,
  scenarios: ScenarioBuilder,
  upload: DataUpload,
  insights: AIInsights,
};

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
};

export default function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  const ActiveComponent = views[activeView] || KPIDashboard;

  return (
    <div className="app-layout">
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <main className={`main-content ${collapsed ? "collapsed" : ""}`}>
        <AnimatePresence mode="wait">
          <motion.div key={activeView} {...pageTransition}>
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
