import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {

  
 
  return (
    <Card className="card">
        <CardContent>
        <CardMedia
        component="img"
        src={product.image}
        />
        <Typography variant="h5" gutterBottom>
        {product.name}
      </Typography>
      <Typography variant="h6" gutterBottom>
        ${product.cost}
      </Typography>
        <Rating name="read-only" value={product.rating} readOnly />
        </CardContent>
        <CardActions disableSpacing>
        <Button fullWidth  variant="contained" type="submit" >
          <AddShoppingCartOutlined  />
          ADD TO CART
          </Button>
          </CardActions>
    </Card>
  );
};

export default ProductCard;
