exports.getDate = function () {
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
    };
    return new Date().toLocaleDateString("en-US", options);
  };
  
  module.exports.getDay = function () {
    const today = new Date();
    const options = {
      weekday: "long",
    };
    return new Date().toLocaleDateString("en-US", options);
  };
  
  console.log(module.exports);
  