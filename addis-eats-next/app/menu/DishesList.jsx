import Dish from "./Dish.jsx";

function DishesList({ dishes }) {
  if (!dishes.length) {
    return (
      <div className="empty-state">
        <h2>No dishes found</h2>
        <p>Try another search term or category.</p>
      </div>
    );
  }

  return (
    <section className="dish-grid" aria-label="Available dishes">
      {dishes.map((dish) => (
        <Dish key={dish.id} dish={dish} />
      ))}
    </section>
  );
}

export default DishesList;
