// Publication records data - July 1, 2024 to June 30, 2025
// Filtered from Excel data to include only publications within date range

const parseDate = (dateStr) => {
  if (!dateStr) return null
  // Handle MM/DD/YYYY format
  if (typeof dateStr === 'string' && dateStr.includes('/')) {
    const parts = dateStr.split('/')
    if (parts.length === 3) {
      let month = parseInt(parts[0])
      let day = parseInt(parts[1])
      let year = parseInt(parts[2])
      if (year < 100) year += 2000
      return new Date(year, month - 1, day)
    }
  }
  // Handle DD-MM-YYYY
  if (typeof dateStr === 'string' && dateStr.includes('-') && !dateStr.match(/[A-Za-z]/)) {
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      let day = parseInt(parts[0])
      let month = parseInt(parts[1])
      let year = parseInt(parts[2])
      if (year < 100) year += 2000
      return new Date(year, month - 1, day)
    }
  }
  return null
}

const extractAuthorName = (authorStr) => {
  if (!authorStr) return 'Unknown'
  const match = authorStr.toString().match(/^([^:]+)/)
  return match ? match[1].trim() : authorStr.toString().trim()
}

const parseImpactFactor = (ifStr) => {
  if (!ifStr || ifStr === 'NA' || ifStr === '--' || ifStr === 'N/A' || ifStr === '') return 0
  if (typeof ifStr === 'number') return isNaN(ifStr) ? 0 : ifStr
  const strValue = String(ifStr).trim()
  if (strValue === 'Not IF' || strValue === 'Not mentioned yet' || strValue === 'Not Applicable' || strValue === 'Not IF') return 0
  const cleaned = strValue.replace(/[^\d.-]/g, '')
  if (cleaned) {
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

// Raw Excel data - publications between July 1, 2024 - June 30, 2025
// Extracted from Excel file with proper date and impact factor parsing
const rawPublications = [
  { title: "RapidMiner-based Clustering Techniques for Enhancing Intrusion Detection System (IDS) Performance", author: "Mr. Muhammad Haroon : 6260", date: "02/07/2024", journal: "Journal of Computing & Biomedical Informatics", scopus: "No", impactFactor: 0 },
  { title: "Forensic Strategies for Revealing Memory Artifacts in IoT Devices", author: "Mr. Muhammad Haroon : 6260", date: "01/08/2024", journal: "Journal of Computing & Biomedical Informatics", scopus: "No", impactFactor: 0 },
  { title: "Improving DeepFake Detection: A Comprehensive Review of Adversarial Robustness, Real-Time Processing and Evaluation Metrics", author: "Mr. Muhammad Haroon : 6260", date: "01/08/2024", journal: "Journal of Computing & Biomedical Informatics", scopus: "No", impactFactor: 0 },
  { title: "EEVMC: An Energy Efficient Virtual Machine Consolidation Approach for Cloud Data Centers", author: "Dr. Farrukh Arslan", date: "01/08/2024", journal: "IEEE Access", scopus: "Yes", impactFactor: 3.4 },
  { title: "Next-Generation Block Ciphers: Achieving Superior Memory Efficiency and Cryptographic Robustness for IoT Devices", author: "Ms. Saadia Aziz : 3322", date: "23/10/2024", journal: "Cryptography-mdpi", scopus: "Yes", impactFactor: 1.8 },
  { title: "Transition-aware human activity recognition using an ensemble deep learning framework", author: "Muhammad Adnan Khan", date: "09/10/2024", journal: "Computers in Human Behavior", scopus: "Yes", impactFactor: 9.9 },
  { title: "Genetic Diversity and Forensic Utility of X-STR Loci in Punjabi and Kashmiri Populations: Insights into Population Structure and Ancestry", author: "Muhammad Adnan Khan", date: "28/10/2024", journal: "Genes", scopus: "Yes", impactFactor: 2.8 },
  { title: "Explanatory and predictive modeling of cybersecurity behaviors using protection motivation theory", author: "Ms. Uzma Kiran : 1629", date: "12/11/2024", journal: "Computers & Security", scopus: "Yes", impactFactor: 4.8 },
  { title: "Convolutional Neural Networks: A Comprehensive Evaluation and Benchmarking of Pooling Layer Variants", author: "Dr. Saman Riaz : 7608", date: "12/11/2024", journal: "MDPI Symmetry", scopus: "Yes", impactFactor: 2.2 },
  { title: "Optimizing smart home energy management for sustainability using machine learning technique", author: "Muhammad Adnan Khan", date: "25/11/2024", journal: "Discover Applied Sciences", scopus: "Yes", impactFactor: 2.4 },
  { title: "Facial expression recognition using visible and IR by early fusion of deep learning with attention mechanism", author: "Muhammad Adnan Khan", date: "03/12/2024", journal: "PeerJ Computer Science", scopus: "Yes", impactFactor: 3.8 },
  { title: "Structural association of requirements engineering challenges in GSD: interpretive structural modelling (ISM) approach", author: "MUHAMMAD YASEEN", date: "01/01/2025", journal: "Requirements Engineering", scopus: "Yes", impactFactor: 2.1 },
  { title: "Smart buildings: Federated learning-driven secure, transparent and smart energy management system using XAI", author: "Muhammad Adnan Khan", date: "30/01/2025", journal: "Energy Reports", scopus: "Yes", impactFactor: 4.7 },
  { title: "A Robust Hybrid Machine Learning based Implications and Preventions of Social Media Blackmailing and Cyber bullying: A Systematic Approach", author: "Mr. Adnan Ahmad", date: "09/02/2025", journal: "The Asian Bulletin of Big Data Management (ABBDM)", scopus: "Yes", impactFactor: 0 },
  { title: "Next Word Prediction for Urdu using Deep Learning Techniques", author: "Mr. Muhammad Haroon : 6260", date: "27/02/2025", journal: "VFAST Transactions on Software Engineering", scopus: "No", impactFactor: 0.3 },
  { title: "Prioritization of Functional Requirements Using Directed Graph and K-Means Clustering", author: "MUHAMMAD YASEEN", date: "01/03/2025", journal: "Journal of Software: Evolution and Process", scopus: "Yes", impactFactor: 2 },
  { title: "Crime Forecasting Using Data Analytics in Pakistan", author: "Mr. Naeem Abbas : 7617", date: "01/03/2025", journal: "Journal of Computing & Biomedical Informatics (JCBI)", scopus: "No", impactFactor: 0 },
  { title: "Efficient and Sustainable Video Surveillance Using CNN-LSTM Model for Suspicious Activity Detection", author: "Ms. Sara Khaleel", date: "02/03/2025", journal: "VFAST Transactions on Software Engineering", scopus: "No", impactFactor: 0.3 },
  { title: "Secure and Transparent Banking: Explainable AI-Driven Federated Learning Model for Financial Fraud Detection", author: "Muhammad Adnan Khan", date: "27/03/2025", journal: "Journal of Risk and Financial Management", scopus: "No", impactFactor: 0 },
  { title: "Requirements Engineering Model (REM): An Assessment Model for Software Vendor Organizations", author: "MUHAMMAD YASEEN", date: "01/04/2025", journal: "Journal of Software: Evolution and Process", scopus: "Yes", impactFactor: 2 },
  { title: "A swin transformer and CNN fusion framework for accurate Parkinson disease classification in MRI", author: "Muhammad Adnan Khan", date: "29/04/2025", journal: "Scientific Reports", scopus: "Yes", impactFactor: 3.8 },
  { title: "Blockchain enabled IoMT and transfer learning for ocular disease classification", author: "Muhammad Adnan Khan", date: "05/05/2025", journal: "SN Applied Sciences", scopus: "No", impactFactor: 0 }
]

// Process and filter publications
const startDate = new Date(2024, 6, 1) // July 1, 2024
const endDate = new Date(2025, 5, 30) // June 30, 2025

export const publicationsData = rawPublications
  .map(pub => {
    const pubDate = parseDate(pub.date)
    if (pubDate && pubDate >= startDate && pubDate <= endDate) {
      return {
        title: pub.title.trim(),
        author: pub.author.trim(),
        authorName: extractAuthorName(pub.author),
        date: pubDate,
        journal: pub.journal ? pub.journal.trim() : '',
        scopus: pub.scopus && (pub.scopus.toLowerCase().includes('yes') || pub.scopus === 'Yes'),
        impactFactor: parseImpactFactor(pub.impactFactor)
      }
    }
    return null
  })
  .filter(pub => pub !== null)
