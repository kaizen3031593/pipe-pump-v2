exports.handler = async function(event) {
  message = "The date and time is: " + new Date(Date.now()).toLocaleString();
  let response = {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: message
  };
  return response;
};