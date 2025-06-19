export async function onRequestGet(context) {
  const id = context.params.id;
  const views = await context.env.PASTE_VIEWS.get(id);

  return new Response(views || "0", {
    headers: { "Content-Type": "text/plain" }
  });
}
