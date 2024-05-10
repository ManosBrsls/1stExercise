"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });



  

const Heatmap = ({ gcImsData }) => {



    

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const layout = {
    title: 'GC IMS Heatmap',
    xaxis: { title: 'X Axis Title' },
    yaxis: { title: 'Y Axis Title' }
  };

  return <Plot data={[{ z: gcImsData, type: 'heatmap' }]} layout={layout} />;
};

export default Heatmap;


