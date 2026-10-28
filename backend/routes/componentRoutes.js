import express from "express";
import { getComponentModel } from "../models/components.model.js";
import ComponentCategory from "../models/componentCategory.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";
import { APIQueryBuilder } from "../utils/apiQueryBuilder.js";

const router = express.Router();

// GET all categories
router.get(
  "/categories",
  asyncHandler(async (req, res) => {
    const categories = await ComponentCategory.find().lean();

    const formattedCategories = categories.map((category) => ({
      title: category.title,
      img: category.img,
      href: `/components/${category.title.toLowerCase().replace(/\s+/g, "-")}`,
    }));

    res.json(formattedCategories);
  })
);

// GET all components of a specific type (with APIQueryBuilder: Filtering, Sorting, Pagination)
router.get(
  "/:type",
  asyncHandler(async (req, res, next) => {
    const { type } = req.params;
    const ComponentModel = getComponentModel(type);

    if (!ComponentModel) {
      return next(new AppError(`Component category "${type}" is not recognized`, 404));
    }

    const hasPaginationOrFilter =
      req.query.page ||
      req.query.limit ||
      req.query.sort ||
      req.query.fields ||
      req.query.search ||
      req.query.price ||
      req.query.company;

    if (hasPaginationOrFilter) {
      const features = new APIQueryBuilder(ComponentModel.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

      const [components, pagination] = await Promise.all([
        features.query.lean(),
        features.getPaginationMetadata(ComponentModel),
      ]);

      return res.status(200).json({
        success: true,
        count: components.length,
        pagination,
        data: components,
      });
    }

    // Default: Backwards-compatible raw array response for existing frontend pages
    const components = await ComponentModel.find({}).lean();
    res.setHeader("X-Total-Count", components.length);
    return res.status(200).json(components);
  })
);

// GET distinct companies for a category
router.get(
  "/companies/:type",
  asyncHandler(async (req, res, next) => {
    const { type } = req.params;
    const ComponentModel = getComponentModel(type);

    if (!ComponentModel) {
      return next(new AppError(`Component category "${type}" is not recognized`, 404));
    }

    const companies = await ComponentModel.distinct("company");
    res.status(200).json(companies);
  })
);

// GET the price range (min and max price) for a specific component type
router.get(
  "/pricerange/:type",
  asyncHandler(async (req, res, next) => {
    const { type } = req.params;
    const ComponentModel = getComponentModel(type);

    if (!ComponentModel) {
      return next(new AppError(`Component category "${type}" is not recognized`, 404));
    }

    const [minPriceDoc, maxPriceDoc] = await Promise.all([
      ComponentModel.findOne().sort({ price: 1 }).select("price").lean(),
      ComponentModel.findOne().sort({ price: -1 }).select("price").lean(),
    ]);

    const minPrice = minPriceDoc?.price || 0;
    const maxPrice = maxPriceDoc?.price || 0;

    res.status(200).json({ minPrice, maxPrice });
  })
);

// GET a specific component by ID within a category
router.get(
  "/:type/:id",
  asyncHandler(async (req, res, next) => {
    const { type, id } = req.params;
    const ComponentModel = getComponentModel(type);

    if (!ComponentModel) {
      return next(new AppError(`Component category "${type}" is not recognized`, 404));
    }

    const component = await ComponentModel.findById(id).lean();

    if (!component) {
      return next(new AppError(`Component with ID "${id}" not found`, 404));
    }

    res.status(200).json(component);
  })
);

export default router;
