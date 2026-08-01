-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role text not null check (role in ('admin', 'editor', 'investor', 'customer')) default 'customer',
  full_name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Projects Table
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  title_ar text not null,
  title_en text not null,
  description_ar text,
  description_en text,
  category text not null check (category in ('residential', 'commercial', 'mixed')),
  status text not null check (status in ('upcoming', 'planning', 'under_construction', 'completed', 'sold_out')),
  progress integer default 0,
  area text,
  year text,
  units integer,
  location_ar text,
  location_en text,
  map_embed_url text,
  latitude decimal,
  longitude decimal,
  cover_image text,
  video_url text,
  features text[], -- array of features
  seo_title text,
  seo_description text,
  featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Project Images
create table public.project_images (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects on delete cascade not null,
  image_url text not null,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Project Updates
create table public.project_updates (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects on delete cascade not null,
  content_ar text not null,
  content_en text not null,
  progress integer,
  image_url text,
  update_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Articles (Blog)
create table public.articles (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  title_ar text not null,
  title_en text not null,
  content_ar text not null,
  content_en text not null,
  image_url text,
  author_id uuid references public.profiles,
  published boolean default false,
  seo_title text,
  seo_description text,
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Contact Messages
create table public.contact_messages (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  phone text not null,
  email text,
  subject text,
  message text not null,
  status text check (status in ('unread', 'read', 'replied', 'archived')) default 'unread',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Website Settings
create table public.website_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Investors (extends profiles for investor specific data if needed)
create table public.investors (
  id uuid references public.profiles on delete cascade primary key,
  investment_type text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Investor Projects (many-to-many relationship)
create table public.investor_projects (
  id uuid default uuid_generate_v4() primary key,
  investor_id uuid references public.investors on delete cascade not null,
  project_id uuid references public.projects on delete cascade not null,
  investment_percentage decimal,
  investment_amount decimal,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(investor_id, project_id)
);

-- 10. Activity Logs
create table public.activity_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users,
  action text not null,
  entity text not null,
  entity_id text,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- Row Level Security (RLS)

-- Profiles: Users can read their own profile. Admins can read all.
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can update profiles" on public.profiles for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Projects: Everyone can view projects. Only admins can insert/update/delete.
alter table public.projects enable row level security;
create policy "Projects are viewable by everyone" on public.projects for select using (true);
create policy "Admins can insert projects" on public.projects for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can update projects" on public.projects for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can delete projects" on public.projects for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Similar policies for project_images and project_updates
alter table public.project_images enable row level security;
create policy "Project images are viewable by everyone" on public.project_images for select using (true);
create policy "Admins can manage project images" on public.project_images for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

alter table public.project_updates enable row level security;
create policy "Project updates are viewable by everyone" on public.project_updates for select using (true);
create policy "Admins can manage project updates" on public.project_updates for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Articles: Published viewable by everyone. All viewable and editable by admins/editors.
alter table public.articles enable row level security;
create policy "Published articles are viewable by everyone" on public.articles for select using (published = true);
create policy "Admins and editors can view all articles" on public.articles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor'))
);
create policy "Admins and editors can manage articles" on public.articles for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor'))
);

-- Contact Messages: Anyone can insert. Only admins can read/update/delete.
alter table public.contact_messages enable row level security;
create policy "Anyone can insert contact messages" on public.contact_messages for insert with check (true);
create policy "Admins can view contact messages" on public.contact_messages for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can manage contact messages" on public.contact_messages for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Website Settings: Everyone can read. Only admins can write.
alter table public.website_settings enable row level security;
create policy "Settings are viewable by everyone" on public.website_settings for select using (true);
create policy "Admins can manage settings" on public.website_settings for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Investors and Investor Projects: Admins can see all. Investors can only see their own.
alter table public.investors enable row level security;
create policy "Admins can manage investors" on public.investors for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Investors can view own info" on public.investors for select using (id = auth.uid());

alter table public.investor_projects enable row level security;
create policy "Admins can manage investor projects" on public.investor_projects for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Investors can view own projects" on public.investor_projects for select using (investor_id = auth.uid());

-- Activity Logs: Only admins can view. System/Admins insert.
alter table public.activity_logs enable row level security;
create policy "Admins can view activity logs" on public.activity_logs for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Authenticated users can insert activity logs" on public.activity_logs for insert with check (auth.role() = 'authenticated');

-- Triggers for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
before update on public.profiles
for each row execute procedure public.handle_updated_at();

create trigger set_updated_at
before update on public.projects
for each row execute procedure public.handle_updated_at();

create trigger set_updated_at
before update on public.articles
for each row execute procedure public.handle_updated_at();

create trigger set_updated_at
before update on public.website_settings
for each row execute procedure public.handle_updated_at();


-- Create Storage Buckets (requires Storage API to be enabled in Supabase)
insert into storage.buckets (id, name, public) values ('media', 'media', true);

create policy "Media images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'media' );

create policy "Admins can upload media images."
  on storage.objects for insert
  with check ( bucket_id = 'media' and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') );

create policy "Admins can update media images."
  on storage.objects for update
  using ( bucket_id = 'media' and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') );

create policy "Admins can delete media images."
  on storage.objects for delete
  using ( bucket_id = 'media' and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') );

-- Trigger to automatically create profile on sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, phone, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'phone',
    'customer'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    phone = coalesce(excluded.phone, public.profiles.phone);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
