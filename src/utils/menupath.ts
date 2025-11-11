import { MenuPath } from "@interfaces/Sidebar";
import { HOME_PATH, MY_ORDERS_PATH, PRODUCTS_CATALOG, SALES_CHANNELS_PATH, MARKETPLACE_PATH, PRODUCTS_INVENTORY, PRODUCTS_PRICES, MY_CATALOGUE, ABANDONEDCART_PATH } from './paths';  //eslint-disable-line
import * as ActiveSvgs from '@assets/menus/active';
import * as InactiveSvgs from '@assets/menus/inactive';

export const mockMenuPaths: MenuPath[] = [
{
		href: HOME_PATH,
		text: 'Home', // "Home"
		icon: InactiveSvgs.Home,
		activeIcon: ActiveSvgs.Home,
		type: 'LINK' 
	},
	{
		href: PRODUCTS_CATALOG,
		text: 'My products', // "My products"
		icon: InactiveSvgs.ProductsSvg,
		activeIcon: ActiveSvgs.ProductsSvg,
		type: 'LINK', 
		subPaths: [
			{
				href: PRODUCTS_CATALOG,
				text: 'Product list', // "Product list"
			},
			{
				href: MY_CATALOGUE,
				text: 'Catalogues', // "Prices"
			},
			{
				href: PRODUCTS_INVENTORY,
				text: 'Inventory', // "Inventory"
			},
			{
				href: PRODUCTS_PRICES,
				text: 'Prices', // "Prices"
			}
		],
	},
	{
		href: MY_ORDERS_PATH,
		text: 'My orders', // "My orders"
		icon: InactiveSvgs.ClipSvg,
		activeIcon: ActiveSvgs.ClipSvg,
		type: 'LINK', 
		subPaths: [
			{
				href: MY_ORDERS_PATH,
				text: 'Order list', // "Order list"
			},
			{
				href: ABANDONEDCART_PATH,
				text: 'Cart and abandoned purchase', // "Cart and abandoned purchase"
			},
		],
	},
	{
		href: SALES_CHANNELS_PATH,
		text: 'Sales channels', // "Sales Channels"
		icon: InactiveSvgs.ChannelsSvg,
		activeIcon: ActiveSvgs.ChannelsSvg,
		type: 'LINK', 
		subPaths: [
			{
				href: MARKETPLACE_PATH,
				text: 'Marketplace', // "Marketplace"
			},
		],
	},
];