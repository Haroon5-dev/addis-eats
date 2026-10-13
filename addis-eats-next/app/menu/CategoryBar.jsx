"use client";

import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

function CategoryBar({ categories, children }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const filterRef = useRef(null);

  useEffect(() => {
    const cards = filterRef.current?.querySelectorAll("[data-dish-category]") ?? [];

    cards.forEach((card) => {
      card.hidden =
        selectedCategory !== "All" &&
        card.dataset.dishCategory !== selectedCategory;
    });
  }, [selectedCategory]);

  return (
    <div className="menu-filter" ref={filterRef}>
      <div className="category-bar" aria-label="Filter dishes by category">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category ? "selected" : ""}
          >
            {category}
          </button>
        ))}
      </div>

      {children}
    </div>
  );
}

CategoryBar.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.node.isRequired,
};

export default CategoryBar;
