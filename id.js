export async function onRequestGet(context) {
  const id = context.params.id;
  const paste = await context.env.PASTES.get(id, { type: 'json' });

  if (!paste) {
    return new Response("Not Found", { status: 404 });
  }

  // Increment view count
  const views = await context.env.PASTE_VIEWS.get(id);
  const newViews = (views ? parseInt(views) : 0) + 1;
  await context.env.PASTE_VIEWS.put(id, newViews.toString());

  return Response.json(paste);
}
