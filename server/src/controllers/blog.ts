import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import logging from '../Config/logging';
import Blog from '../model/blog';

const create = async (req: Request, res: Response, next: NextFunction) => {
  logging.info('Attempting to create blog ...');

  let { author, title, content, headline, picture } = req.body;

  const blog = await new Blog({
    _id: new mongoose.Types.ObjectId(),
    author,
    title,
    content,
    headline,
    picture,
  });

  return blog
    .save()
    .then((newBlog) => {
      logging.info(`New blog created`);

      return res.status(201).json({ blog: newBlog });
    })
    .catch((error) => {
      logging.error(error.message);

      return res.status(500).json({
        message: error.message,
      });
    });
};

const read = async (req: Request, res: Response, next: NextFunction) => {
  const _id = req.params.blogID;
  logging.info(`Incoming read for blog with id ${_id}`);

  await Blog.findById(_id)
    .populate('author')
    .exec()
    .then((blog) => {
      if (blog) {
        return res.status(200).json({ blog });
      } else {
        return res.status(404).json({
          error: 'Blog not found.',
        });
      }
    })
    .catch((error) => {
      logging.error(error.message);

      return res.status(500).json({
        error: error.message,
      });
    });
};

const readAll = async (req: Request, res: Response, next: NextFunction) => {
  logging.info('Returning all blogs ');

  await Blog.find()
    .populate('author')
    .exec()
    .then((blogs) => {
      return res.status(200).json({
        count: blogs.length,
        blogs: blogs,
      });
    })
    .catch((error) => {
      logging.error(error.message);

      return res.status(500).json({
        message: error.message,
      });
    });
};

const query = async (req: Request, res: Response, next: NextFunction) => {
  logging.info('Query route called');

  await Blog.find(req.body)
    .populate('author')
    .exec()
    .then((blogs) => {
      return res.status(200).json({
        count: blogs.length,
        blogs: blogs,
      });
    })
    .catch((error) => {
      logging.error(error.message);

      return res.status(500).json({
        message: error.message,
      });
    });
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  logging.info('Update route called');

  const _id = req.params.blogID;

  await Blog.findById(_id)
    .exec()
    .then((blog) => {
      if (blog) {
        blog.set(req.body);
        blog
          .save()
          .then((savedBlog) => {
            logging.info(`Blog with id ${_id} updated`);

            return res.status(201).json({
              blog: savedBlog,
            });
          })
          .catch((error) => {
            logging.error(error.message);

            return res.status(500).json({
              message: error.message,
            });
          });
      } else {
        return res.status(401).json({
          message: 'NOT FOUND',
        });
      }
    })
    .catch((error) => {
      logging.error(error.message);

      return res.status(500).json({
        message: error.message,
      });
    });
};

const deleteBlog = async (req: Request, res: Response, next: NextFunction) => {
  logging.warn('Delete route called');

  const _id = req.params.blogID;

  await Blog.findByIdAndDelete(_id)
    .exec()
    .then(() => {
      return res.status(201).json({
        message: 'Blog deleted',
      });
    })
    .catch((error) => {
      logging.error(error.message);

      return res.status(500).json({
        message: error.message,
      });
    });
};

export default {
  create,
  read,
  readAll,
  query,
  update,
  deleteBlog,
};
