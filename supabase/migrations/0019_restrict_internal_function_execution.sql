-- These functions are used internally by database triggers or maintenance hooks.
-- They do not need an externally callable REST or GraphQL execution surface.

begin;

revoke all on function public.handle_catalog_new_user() from public, anon, authenticated;
revoke all on function public.rls_auto_enable() from public, anon, authenticated;

grant execute on function public.handle_catalog_new_user() to service_role;
grant execute on function public.rls_auto_enable() to service_role;

commit;
