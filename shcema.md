# User

1. Register & Login
2. Products selection
3. Go to Cart
4. Proceed to Buy

- FirstName

- LastName
- Email
- Password
- Role By Default "Customer"
- isActive
- CreatedAt


# Cart

- CartID

- UserID
- Items : [ ProductID, Quantity ]


# Product

- ProductID

- SellerID
- CategoryID
- Product_Name
- Product_Price
- Discount_Price
- Product_Description
- Stock
- Images: [ ...images ]
- isActive


# Seller

- Role: Seller

- _id
- UserID
- GST_No
- ShopName
- BankDetails
- isVerifiedByAdmin

# Categories

- _id

- CategoryName
- Category_Slug
- Category_Image

# Orders

- _id

- BuyerID -> UserID
- Items: [ productId -> ProductTable, sellerId, Quantity, priceAtPurchase]
- TotalAmount
- ShippingAdderess 
- PaymentMethod ( COD/ Online)
- PaymentStatus
- OrderStatus
- CreatedAt

