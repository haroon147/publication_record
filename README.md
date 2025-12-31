# Publication Record Portal

A React-based web portal for analyzing university publication records with quarterly breakdowns, author statistics, and comprehensive analytics.

## Features

- 📊 **Excel File Upload**: Upload and parse Excel files (.xlsx, .xls, .csv)
- 📅 **Date Range Filtering**: Automatically filters publications from July 1, 2024 to June 30, 2025
- 📈 **Quarterly Analysis**: Divides publications into 4 quarters:
  - **Q1**: July, August, September
  - **Q2**: October, November, December
  - **Q3**: January, February, March
  - **Q4**: April, May, June
- 🏆 **Author Leaderboard**: Shows top contributors with publication counts and impact factors
- 📑 **Publication List**: Browse all publications with search and filter capabilities
- ✅ **Scopus Indexing**: Track Scopus-indexed publications
- ⭐ **Impact Factor Calculation**: Calculate total and average impact factors by quarter and author

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Excel File Format

Your Excel file should have the following columns:

### Required Columns:
- **Title** (or "Paper", "Publication"): Publication title
- **Author** (or "Name"): Author name (can include ID after colon, e.g., "Dr. John Doe : 1234")

### Optional Columns:
- **Date** (or "Published", "Publication Date"): Publication date
  - Supported formats: MM/DD/YYYY, DD-MM-YYYY, or Excel date serial number
- **Journal** (or "Conference", "Venue"): Journal or conference name
- **Scopus** (or "Indexed"): "Yes" or "No" for Scopus indexing
- **Impact Factor** (or "IF", "Impact Factor"): Numeric value (e.g., 3.5, 5.2)

### Example Excel Structure:

| Title | Author | Date | Journal | Scopus | Impact Factor |
|-------|--------|------|---------|--------|---------------|
| Machine Learning Applications | Dr. John Doe : 1234 | 08/15/2024 | IEEE Access | Yes | 3.5 |
| Data Science Research | Dr. Jane Smith : 5678 | 12/01/2024 | Nature | Yes | 5.2 |

## Usage

1. **Upload Excel File**: Click the upload area and select your Excel file
2. **View Statistics**: See total publications, total impact factor, top contributor, and Scopus count
3. **Quarterly Breakdown**: View publications divided by quarters with impact factor totals per quarter
4. **Author Leaderboard**: See top 10 contributors ranked by publication count with their total and average impact factors
5. **Browse Publications**: Search, filter by quarter/author, and sort publications with impact factor display

## Technologies Used

- React 18
- Vite
- XLSX (SheetJS) for Excel parsing
- Lucide React for icons
- Tailwind CSS (via CDN)

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Notes

- Only publications with dates between July 1, 2024 and June 30, 2025 are included
- Author names are extracted from the Author column (text before colon if present)
- The system automatically detects column names (case-insensitive)
- Impact factor is calculated as the sum of all publication impact factors in the date range
- Quarterly impact factors show the total impact factor for publications in each quarter
- Author impact factors show both total and average impact factor per author

