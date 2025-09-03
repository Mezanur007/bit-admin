import { useState } from "react";

export default function usePagination(perPageRecords, totalPageRecords) {
  const totalPages = Math.ceil(totalPageRecords / perPageRecords);
  const [currentPageIndex, setcurrentPageIndex] = useState(1);

  const endPageIndex = currentPageIndex * perPageRecords;

  const startPageIndex = endPageIndex - perPageRecords;

  const displayPage = (pageNo) => {
    setcurrentPageIndex(pageNo);
    window.scrollTo(0, 0);
  };

  return {
    totalPages,
    startPageIndex,
    endPageIndex,
    currentPageIndex,
    setcurrentPageIndex,
    displayPage,
  };
}
