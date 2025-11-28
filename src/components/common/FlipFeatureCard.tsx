interface Props {
  frontImage: string;
  titleFront: string;
  titleBack: string;
  descriptionBack: string;
}

const FlipFeatureCard = ({ frontImage, titleFront, titleBack, descriptionBack }: Props) => {
  return (
    <div className="flip-container">
      <div className="flip-inner">

        {/* FRONT */}
        <div
          className="flip-front"
          style={{ backgroundImage: `url(${frontImage})` }}
        >
          <div className="flip-front-text">
            {titleFront}
          </div>
        </div>

        {/* BACK */}
        <div className="flip-back">
          <h3>{titleBack}</h3>
          <p>{descriptionBack}</p>
        </div>

      </div>
    </div>
  );
};

export default FlipFeatureCard;
