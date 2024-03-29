module.exports = {
  currency: require('./currencyValidator'),
  validate: (data, schema, next) => {
    const result = schema.validate(data, { abortEarly: false });

    if (result.error) {
      const error = { status: 422, message: result.error.message };

      return next(error);
    }
    return result.value;
  },
};
