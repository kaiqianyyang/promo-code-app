import { Link } from "react-router-dom";
import Slider from "../components/Slider";
import dogCategoryImage from "../assets/jpg/dogCategoryImage.jpg";
import catCategoryImage from "../assets/jpg/catCategoryImage.jpg";

function Explore() {
  return (
    <div className="explore">
      <header>
        <p className="pageHeader">Explore</p>
      </header>

      <main>
        <Slider />
        <p className="exploreCategoryHeading">Categories</p>
        <div className="exploreCategories">

          <Link to="/category/dog">
            <img
              src={dogCategoryImage}
              alt="dog"
              className="exploreCategoryImg"
            />
            <p className="exploreCategoryName">Dog sales</p>
          </Link>

          <Link to="/category/cat">
            <img
              src={catCategoryImage}
              alt="cat"
              className="exploreCategoryImg"
            />
            <p className="exploreCategoryName">Cat sales</p>
          </Link>

        </div>
      </main>
    </div>
  );
}

export default Explore;
