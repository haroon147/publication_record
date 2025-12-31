import React, { useState, useEffect } from 'react';

const ScopusPaperFilter = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const parseDate = (dateStr) => {
      if (!dateStr || dateStr === 'NA' || dateStr === '--' || dateStr === 'N/A' || dateStr === '') return null;
      
      // Handle MM/DD/YYYY format
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          let month = parseInt(parts[0]);
          let day = parseInt(parts[1]);
          let year = parseInt(parts[2]);
          if (year < 100) year += 2000;
          return new Date(year, month - 1, day);
        }
      }
      
      // Handle MMM-DD or Month-DD format
      const monthMatch = dateStr.match(/([A-Za-z]{3})-(\d{1,2})/);
      if (monthMatch) {
        const months = {
          'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
          'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
        };
        const month = months[monthMatch[1].toLowerCase()];
        const day = parseInt(monthMatch[2]);
        return new Date(2024, month, day);
      }
      
      // Try standard Date parsing
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    };

    const analyzePapers = () => {
      try {
        // Data extracted from the provided document
        const data = [
          // July 2024 - June 2025 publications
          { title: "Emergence of Novel WEDEx-Kerberotic Cryptographic Framework to Strengthen the Cloud Data Security against Malicious Attacks", author: "Dr. Saman Riaz : 7608", date: "13/05/2024", journal: "MDPI Symmetry", scopus: "Yes" },
          { title: "Federated Learning for Privacy-Preserving Intrusion Detection in Software-Defined Networks", author: "Dr. Muhammad Jasim Saeed : 1400", date: "02/05/2024", journal: "IEEE Access", scopus: "Yes" },
          { title: "Short-term solar photovoltaic power forecasting using ensemble forecasting strategy for renewable resources based power systems", author: "Ms. Madeeha Kanwal : 5671", date: "04/06/2024", journal: "Engineering Research Express", scopus: "Yes" },
          { title: "Machine Learning for Improved Threat Detection: LightGBM vs. CatBoost", author: "Mr. Zeeshan Mubeen : 7583", date: "01/06/2024", journal: "Journal of Computing & Biomedical Informatics", scopus: "No" },
          { title: "Securing IoT: Balancing Privacy and Attack Prediction", author: "Mr. Zeeshan Mubeen : 7583", date: "01/06/2024", journal: "Journal of Computing & Biomedical Informatics", scopus: "No" },
          { title: "RapidMiner-based Clustering Techniques for Enhancing Intrusion Detection System (IDS) Performance", author: "Mr. Muhammad Haroon : 6260", date: "02/07/2024", journal: "Journal of Computing & Biomedical Informatics", scopus: "No" },
          { title: "Forensic Strategies for Revealing Memory Artifacts in IoT Devices", author: "Mr. Muhammad Haroon : 6260", date: "01/08/2024", journal: "Journal of Computing & Biomedical Informatics", scopus: "No" },
          { title: "Improving DeepFake Detection: A Comprehensive Review of Adversarial Robustness, Real-Time Processing and Evaluation Metrics", author: "Mr. Muhammad Haroon : 6260", date: "01/08/2024", journal: "Journal of Computing & Biomedical Informatics", scopus: "No" },
          { title: "Next-Generation Block Ciphers: Achieving Superior Memory Efficiency and Cryptographic Robustness for IoT Devices", author: "Ms. Saadia Aziz : 3322", date: "23/10/2024", journal: "Cryptography-mdpi", scopus: "Yes" },
          { title: "Explanatory and predictive modeling of cybersecurity behaviors using protection motivation theory", author: "Ms. Uzma Kiran : 1629", date: "12/11/2024", journal: "Computers & Security", scopus: "Yes" },
          { title: "Convolutional Neural Networks: A Comprehensive Evaluation and Benchmarking of Pooling Layer Variants", author: "Dr. Saman Riaz : 7608", date: "12/11/2024", journal: "MDPI Symmetry", scopus: "Yes" },
          { title: "A Robust Hybrid Machine Learning based Implications and Preventions of Social Media Blackmailing and Cyber bullying: A Systematic Approach", author: "Mr. Adnan Ahmad", date: "09/02/2025", journal: "The Asian Bulletin of Big Data Management (ABBDM)", scopus: "Yes" },
          { title: "Next Word Prediction for Urdu using Deep Learning Techniques", author: "Mr. Muhammad Haroon : 6260", date: "27/02/2025", journal: "VFAST Transactions on Software Engineering", scopus: "No" },
          { title: "Crime Forecasting Using Data Analytics in Pakistan", author: "Mr. Naeem Abbas : 7617", date: "01/03/2025", journal: "Journal of Computing & Biomedical Informatics (JCBI)", scopus: "No" },
          { title: "Efficient and Sustainable Video Surveillance Using CNN-LSTM Model for Suspicious Activity Detection", author: "Ms. Sara Khaleel", date: "02/03/2025", journal: "VFAST Transactions on Software Engineering", scopus: "No" },
          { title: "Transition-aware human activity recognition using an ensemble deep learning framework", author: "Muhammad Adnan Khan", date: "09/10/2024", journal: "Computers in Human Behavior", scopus: "Yes" },
          { title: "Genetic Diversity and Forensic Utility of X-STR Loci in Punjabi and Kashmiri Populations: Insights into Population Structure and Ancestry", author: "Muhammad Adnan Khan", date: "28/10/2024", journal: "Genes", scopus: "Yes" },
          { title: "Optimizing smart home energy management for sustainability using machine learning technique", author: "Muhammad Adnan Khan", date: "25/11/2024", journal: "Discover Applied Sciences", scopus: "Yes" },
          { title: "Smart buildings: Federated learning-driven secure, transparent and smart energy management system using XAI", author: "Muhammad Adnan Khan", date: "30/01/2025", journal: "Energy Reports", scopus: "Yes" },
          { title: "Facial expression recognition using visible and IR by early fusion of deep learning with attention mechanism", author: "Muhammad Adnan Khan", date: "03/12/2024", journal: "PeerJ Computer Science", scopus: "Yes" },
          { title: "Secure and Transparent Banking: Explainable AI-Driven Federated Learning Model for Financial Fraud Detection", author: "Muhammad Adnan Khan", date: "27/03/2025", journal: "Journal of Risk and Financial Management", scopus: "No" },
          { title: "A swin transformer and CNN fusion framework for accurate Parkinson disease classification in MRI", author: "Muhammad Adnan Khan", date: "29/04/2025", journal: "Scientific Reports", scopus: "Yes" },
          { title: "Blockchain enabled IoMT and transfer learning for ocular disease classification", author: "Muhammad Adnan Khan", date: "05/05/2025", journal: "SN Applied Sciences", scopus: "No" },
          { title: "Requirements Engineering Model (REM): An Assessment Model for Software Vendor Organizations", author: "MUHAMMAD YASEEN", date: "01/04/2025", journal: "Journal of Software: Evolution and Process", scopus: "Yes" },
          { title: "Prioritization of Functional Requirements Using Directed Graph and K-Means Clustering", author: "MUHAMMAD YASEEN", date: "01/03/2025", journal: "Journal of Software: Evolution and Process", scopus: "Yes" },
          { title: "Structural association of requirements engineering challenges in GSD: interpretive structural modelling (ISM) approach", author: "MUHAMMAD YASEEN", date: "01/01/2025", journal: "Requirements Engineering", scopus: "Yes" },
          { title: "EEVMC: An Energy Efficient Virtual Machine Consolidation Approach for Cloud Data Centers", author: "Dr. Farrukh Arslan", date: "01/08/2024", journal: "IEEE Access", scopus: "Yes" }
        ];

        const startDate = new Date(2024, 6, 1); // July 1, 2024
        const endDate = new Date(2025, 5, 30); // June 30, 2025
        
        const filteredPapers = data.filter(paper => {
          if (paper.scopus.toLowerCase() !== 'yes') return false;
          
          const pubDate = parseDate(paper.date);
          return pubDate && pubDate >= startDate && pubDate <= endDate;
        });
        
        setPapers(filteredPapers);
      } catch (error) {
        console.error('Error processing data:', error);
      } finally {
        setLoading(false);
      }
    };

    analyzePapers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Scopus Indexed Papers Analysis
        </h1>
        <p className="text-gray-600 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Period: July 1, 2024 - June 30, 2025
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 mb-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm mb-1">Total Scopus Indexed Papers</p>
            <p className="text-5xl font-bold">{papers.length}</p>
          </div>
          <CheckCircle className="w-16 h-16 text-blue-200" />
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Paper Details
        </h2>
        
        {papers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No Scopus-indexed papers found in the specified period.
          </p>
        ) : (
          <div className="space-y-4">
            {papers.map((paper, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800 flex-1 pr-4">
                    {index + 1}. {paper.title}
                  </h3>
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {paper.date}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="mb-1"><strong>Author:</strong> {paper.author}</p>
                  <p><strong>Journal/Conference:</strong> {paper.journal}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScopusPaperFilter;