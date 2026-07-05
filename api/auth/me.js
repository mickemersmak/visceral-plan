const {
  publicUser,
  requireSession,
  sendError,
  setNoStore
} = require("../_db");

module.exports = async function handler(req, res) {
  setNoStore(res);

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ message: "Only GET is allowed." });
    return;
  }

  try {
    const user = await requireSession(req);
    res.status(200).json({ user: publicUser(user) });
  } catch (error) {
    sendError(res, error);
  }
};
