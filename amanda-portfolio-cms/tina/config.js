import { defineConfig } from "tinacms";

export const config = defineConfig({
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  branch:
    process.env.NEXT_PUBLIC_TINA_BRANCH || // custom branch env override
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF || // Vercel branch env
    process.env.HEAD, // Netlify branch env
  token: process.env.TINA_TOKEN,
  media: {
    tina: {
      publicFolder: "public",
      mediaRoot: "uploads",
    },
  },
  build: {
    publicFolder: "public", // The public asset folder for your framework
    outputFolder: "admin", // within the public folder
  },
  schema: {
    collections: [
      {
        name: "portfolio",
        label: "Portfolio",
        path: "content/portfolio",
        format: "json",
        ui: {
          allowedActions: {
            create: true,
            delete: true,
          },
          filename: {
            readonly: true,
            slugify: (values) => {
              return `${values?.title?.toLowerCase().replace(/ /g, '-') || 'untitled'}`
            }
          }
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Project Title",
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Project Description",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "image",
            name: "heroImage",
            label: "🎨 Hero Image (Drag & Drop)",
            description: "Main image shown in the gallery grid. Drag and drop to upload!",
            required: true,
          },
          {
            type: "image",
            name: "projectImages",
            label: "📸 Project Images",
            description: "Click the plus icon to add an image field then drag and drop one by one",
            list: true,
          },
          {
            type: "string",
            name: "category",
            label: "Category",
            options: ["Fashion", "Luxury", "Digital", "Sustainable", "Editorial"],
          },
          {
            type: "string",
            name: "year",
            label: "Year",
          },
          {
            type: "string",
            name: "client",
            label: "Client/Brand",
          },
          {
            type: "number",
            name: "order",
            label: "Display Order",
            required: true,
          },
        ],
      },
      {
        name: "settings",
        label: "Site Settings",
        path: "content/settings",
        format: "json",
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        match: {
          include: "site",
        },
        fields: [
          {
            type: "string",
            name: "siteTitle",
            label: "Site Title",
            required: true,
          },
          {
            type: "string",
            name: "portfolioIntro",
            label: "Portfolio Introduction",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "object",
            name: "contact",
            label: "Contact Information",
            fields: [
              {
                type: "string",
                name: "email",
                label: "Email",
              },
              {
                type: "string",
                name: "instagram",
                label: "Instagram URL",
              },
              {
                type: "string",
                name: "location",
                label: "Location",
              },
            ],
          },
        ],
      },
    ],
  },
});

export default config;
