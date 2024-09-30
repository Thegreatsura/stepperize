import { source } from "@/app/source";
import type { InferPageType, LoaderConfig, LoaderOutput } from "fumadocs-core/source";
import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";
import type { Metadata } from "next/types";

interface ImageMeta {
	alt: string;
	url: string;
	width: number;
	height: number;
}

interface RouteOptions {
	params: {
		slug: string[];
		lang?: string;
	};
}

export function createMetadataImage<S extends LoaderOutput<LoaderConfig>>(options: {
	source: S;

	/**
	 * the route of your OG image generator.
	 *
	 * @example '/docs-og'
	 * @defaultValue '/docs-og'
	 */
	imageRoute?: string;

	/**
	 * The filename of generated OG Image
	 *
	 * @defaultValue 'image.png'
	 */
	filename?: string;
}): {
	getImageMeta: (slugs: string[]) => ImageMeta;

	/**
	 * Add image meta tags to metadata
	 */
	withImage: (slugs: string[], metadata?: Metadata) => Metadata;

	/**
	 * Generate static params for OG Image Generator
	 */
	generateParams: () => {
		slug: string[];
		lang?: string;
	}[];

	/**
	 * create route handler for OG Image Generator
	 */
	createAPI: (
		handler: (page: InferPageType<S>, request: NextRequest, options: RouteOptions) => Response | Promise<Response>,
	) => (request: NextRequest, options: RouteOptions) => Response | Promise<Response>;
} {
	const { filename = "image.png", imageRoute = "/docs-og" } = options;

	function getImageMeta(slugs: string[]): ImageMeta {
		return {
			alt: "Banner",
			url: `/${[...imageRoute.split("/"), ...slugs, filename].filter((v) => v.length > 0).join("/")}`,
			width: 1200,
			height: 630,
		};
	}

	return {
		getImageMeta,
		withImage(slugs, data) {
			const imageData = getImageMeta(slugs);

			return {
				...data,
				openGraph: {
					images: imageData,
					...data?.openGraph,
				},
				twitter: {
					images: imageData,
					card: "summary_large_image",
					...data?.twitter,
				},
			};
		},
		generateParams() {
			return options.source.generateParams().map((params) => ({
				...params,
				slug: [...params.slug, filename],
			}));
		},
		createAPI(handler) {
			return (req, args) => {
				const params = args.params;
				const page = options.source.getPage(
					params.slug.slice(0, -1), //remove filename
					params.lang,
				);
				if (!page) {
					notFound();
				}

				return handler(page as InferPageType<S>, req, args);
			};
		},
	};
}

export function createMetadata(override: Metadata): Metadata {
	return {
		...override,
		openGraph: {
			title: override.title ?? undefined,
			description: override.description ?? undefined,
			url: "https://stepperize.vercel.app",
			images: "/banner.png",
			siteName: "Stepperize",
			...override.openGraph,
		},
		twitter: {
			card: "summary_large_image",
			creator: "@damianricobelli",
			title: override.title ?? undefined,
			description: override.description ?? undefined,
			images: "/banner.png",
			...override.twitter,
		},
	};
}

export const baseUrl =
	process.env.NODE_ENV === "development" || !process.env.VERCEL_URL
		? new URL("http://localhost:3000")
		: new URL(`https://${process.env.VERCEL_URL}`);

export const metadataImage = createMetadataImage({
	source,
	imageRoute: "og",
});
