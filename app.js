const express = require("express");
const Product = require("./Model/Product");
const { insertInLog } = require("./logFile");
const app = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  return res.status(200).send({ message: "Hello World" });
});

app.get("/products", async (req, res) => {
  try {
    let result = await Product.getAllData();
    let logFileResult = await insertInLog("GET_ALL_PRODUCT");
    // console.log(result);
    if (result.success) {
      return res.status(200).send({
        message: "Successfully fetched all the data",
        data: result?.data,
      });
    } else {
      return res.status(400).send({ message: "Failed to fetch the data" });
    }
  } catch (e) {
    return res.status(400).send({ message: "Internal error occured" });
  }
});

app.post("/product/insert", async (req, res) => {
  try {
    let newProduct = req.body;
    let error = {};
    if (newProduct.hasOwnProperty("id")) {
      error.id = "Id should not be passed in body";
    }
    if (
      !newProduct.hasOwnProperty("title") ||
      newProduct?.title?.toString().trim() == ""
    ) {
      error.title =
        "title should be passed to create a product and it must have some values";
    }

    if (!newProduct.hasOwnProperty("price") || isNaN(newProduct.price)) {
      error.price =
        "price should  be passed to create a product and it must be number type";
    }
    if (
      !newProduct.hasOwnProperty("stock") ||
      isNaN(newProduct.stock) ||
      !Number.isInteger(Number(newProduct.stock))
    ) {
      error.stock =
        "stock should  be passed to create a product and it must be integer type";
    }

    if (Object.keys(error).length > 0) {
      return res
        .status(400)
        .send({ message: "Data is not provided as per requirement", error });
    }
    let result = await Product.insertData(newProduct);
    let logFileResult = await insertInLog("POST_PRODUCT", result.id);
    if (result.success) {
      return res.status(200).send({
        message: "successfully added the data",
      });
    } else {
      return res.status(400).send({ message: "failed to add the data" });
    }
  } catch (e) {
    return res.status(400).send({ message: "Internal error occured" });
  }
});

app.get("/product/find-by-id/:id", async (req, res) => {
  const { id } = req.params;
  if (id) {
    let result = await Product.getSingleData(id);
    // let logFileResult = await insertInLog("GET_ONE_PRODUCT", params.id);
    try {
      if (result.success) {
        if (result?.data)
          return res.status(200).send({
            message: "Successfully fetched the data",
            data: result?.data,
          });
        else
          return res.status(404).send({
            message: "There is no such data with this ID",
          });
      } else {
        return res.status(400).send({
          message: "failed to fetch the data",
        });
      }
    } catch (error) {
      return res.status(400).send({
        message: "Internal error occured",
      });
    }
  } else {
    return res.status(404).send({ message: "Pass an id via your url" });
  }
});

app.put("/product/update/:id", async (req, res) => {
  const { id } = req.params;
  //   console.log(id);
  if (id) {
    try {
      let newProduct = req.body;
      //   console.log("newProduct ", newProduct);
      let error = {};
      if (newProduct.hasOwnProperty("id")) {
        error.id = "Id should not be passed in body";
      }
      //   if (
      //     !newProduct.hasOwnProperty("title") ||
      //     newProduct?.title?.toString().trim() == ""
      //   ) {
      //     error.title =
      //       "title should be passed to create a product and it must have some values";
      //   }

      //   if (!newProduct.hasOwnProperty("price") || isNaN(newProduct.price)) {
      //     error.price =
      //       "price should  be passed to create a product and it must be number type";
      //   }
      //   if (
      //     !newProduct.hasOwnProperty("stock") ||
      //     isNaN(newProduct.stock) ||
      //     !Number.isInteger(Number(newProduct.stock))
      //   ) {
      //     error.stock =
      //       "stock should  be passed to create a product and it must be integer type";
      //   }

      //   if (Object.keys(error).length > 0) {
      //     return res
      //       .status(400)
      //       .send({ message: "Data is not provided as per requirement", error });
      //   }

      let result = await Product.updateProduct(id, newProduct);
      let logFileResult = await insertInLog("UPDATE_PRODUCT", id);
      if (result.success) {
        return res
          .status(200)
          .send({ message: "successfully updated the data" });
      } else {
        if (result.hasOwnProperty("message")) {
          return res
            .status(404)
            .send({ message: "There is no such data with this ID" });
        }
        return res.status(400).send({ message: "failed to add the data" });
      }
    } catch (error) {
      console.log("error ", error);
      return res.status(400).send({ message: "Internal error occured" });
    }
  } else {
    return res
      .status(400)
      .send({ message: "Pass an id via your url in query parameter" });
  }
});

app.delete("/product/delete/:id", async (req, res) => {
  const { id } = req.params;
  if (id) {
    try {
      let result = await Product.deleteProduct(id);
      let logFileResult = await insertInLog("DELETE_PRODUCT", id);

      if (result.success) {
        return res
          .status(200)
          .send({ message: "successfully deleted the data" });
      } else {
        if (result.hasOwnProperty("message")) {
          return res
            .status(404)
            .send({ message: "There is no such data with this ID" });
        }
        return res.status(400).send({ message: "failed to update the data" });
      }
    } catch (e) {
      return res.status(400).send({ message: "Internal error occured" });
    }
  } else {
    return res.status(400).send({ message: "Pass an id via your url" });
  }
});

app.get("/product/find", async (req, res) => {
  try {
    // console.log("find ", req.query);
    if (req.query) {
      let result = await Product.getMultipleData(req.query);
      //   console.log(result);
      if (result.success) {
        if (result?.data) {
          return res.status(200).send({
            message: "successfully fetched the data",
            data: result?.data,
          });
        } else {
          return res.status(200).send({ message: "There is no such data" });
        }
      } else {
        return res.status(400).send({ message: "failed to fetch the data" });
      }
    } else {
      return res.status(200).send({ message: "Pass query parameters" });
    }
  } catch (error) {
    return res.status(400).send({ message: "Internal error occured" });
  }
});

app.use((req, res) => {
  return res.status(400).send({ message: "route doesn't exist" });
});

app.listen(8000, () => {
  console.log("server is running at 8000");
});
