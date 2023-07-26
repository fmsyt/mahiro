import React, { memo } from "react";

const square = ({ image }: { image?: string }) => {
  return (
    <div className="square">
      {image && <img src={image} alt="" className="square-image" />}
    </div>
  );
};

const Square = memo(square);
Square.displayName = "Square";

export default Square;
