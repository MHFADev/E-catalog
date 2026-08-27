-- Privileged admin RPCs are called only by server code through the service-role client.
-- Do not expose these SECURITY DEFINER operations through PostgREST to public users.

begin;

revoke all on function public.admin_approve_seller_account(uuid) from public, anon, authenticated;
revoke all on function public.admin_delete_seller_account(uuid) from public, anon, authenticated;
revoke all on function public.admin_set_seller_account_status(uuid, text) from public, anon, authenticated;
revoke all on function public.verify_admin_credentials(text, text) from public, anon, authenticated;
revoke all on function public.admin_user_is_active(text) from public, anon, authenticated;

grant execute on function public.admin_approve_seller_account(uuid) to service_role;
grant execute on function public.admin_delete_seller_account(uuid) to service_role;
grant execute on function public.admin_set_seller_account_status(uuid, text) to service_role;
grant execute on function public.verify_admin_credentials(text, text) to service_role;
grant execute on function public.admin_user_is_active(text) to service_role;

commit;
