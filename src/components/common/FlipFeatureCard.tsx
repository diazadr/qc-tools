import { useState } from "react";

interface Props {
  frontImage: string;
  titleFront: string;
  titleBack: string;
  descriptionBack: string;
}

const FlipFeatureCard = ({ frontImage, titleFront, titleBack, descriptionBack }: Props) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={`flip-container ${flipped ? "active-flip" : ""}`}
      onClick={() => {
        if (window.matchMedia("(hover: none)").matches) {
          setFlipped((prev) => !prev);
        }
      }}
    >
      <div className="flip-inner">

        <div
          className="flip-front"
          style={{ backgroundImage: `url(${frontImage})` }}
        >
          <div className="flip-front-text">
            {titleFront}
          </div>
        </div>

        <div className="flip-back">
          <h3>{titleBack}</h3>
          <p>{descriptionBack}</p>
        </div>

      </div>
    </div>
  );
};

export default FlipFeatureCard;
