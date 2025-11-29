import { SVGICON } from "./icons.jsx";

export const MenuList = [
    //Content
    { title: 'YOUR COMPANY', classsChange: 'menu-title' },
    {
        title: 'Dashboard', classsChange: 'mm-collapse', iconStyle: SVGICON.Home,
        content: [
            { title: 'Dashboard Light', to: 'dashboard', },
            { title: 'Dashboard Dark', to: 'dashboard-dark', },
            { title: 'Order List', to: 'order-list', },
            { title: 'Order Details', to: 'order-details', },
            { title: 'Analytics', to: 'analytics', },
            { title: 'Customers', to: 'customers', },
            { title: 'Reviews', to: 'reviews', },
            { title: 'Blog', to: 'blog', },
        ],
    },
    { title: 'OUR FEATURES', classsChange: 'menu-title' },
    //Apps
    {
        title: 'Apps',
        classsChange: 'mm-collapse',
        iconStyle: SVGICON.Apps,
        content: [
            { title: 'Chat', to: "/chat", },
            {
                title: "Users Manager", hasMenu: true,
                content: [
                    { title: 'App Profile 1', to: 'app-profile' },
                    { title: 'App Profile 2', to: 'app-profile-2' },
                    { title: 'Edit Profile', to: 'edit-profile' },
                    { title: 'Post Details', to: 'post-details' },
                ],
            },
            {
                title: 'Email', hasMenu: true,
                content: [
                    { title: 'Compose', to: 'email-compose', },
                    { title: 'Inbox', to: 'email-inbox', },
                    { title: 'Read', to: 'email-read', }
                ],
            },
            { title: 'Calendar', to: 'app-calender' },
            {
                title: 'Shop', hasMenu: true,
                content: [
                    { title: 'Product Grid', to: 'ecom-product-grid', },
                    { title: 'Product List', to: 'ecom-product-list', },
                    { title: 'Product Details', to: 'ecom-product-detail', },
                    { title: 'Order', to: 'ecom-product-order', },
                    { title: 'Checkout', to: 'ecom-checkout', },
                    { title: 'Invoice', to: 'ecom-invoice', },
                    { title: 'Customers', to: 'ecom-customers', },
                ],
            },
        ],
    },
    //Charts
    {
        title: 'Charts', classsChange: 'mm-collapse', iconStyle: SVGICON.Charts,
        content: [
            { title: 'RechartJs', to: 'chart-rechart', },
            { title: 'Chartjs', to: 'chart-chartjs', },
            { title: 'Sparkline', to: 'chart-sparkline', },
            { title: 'Apexchart', to: 'chart-apexchart', },
        ]
    },
    //Boosttrap
    {
        title: 'Bootstrap', classsChange: 'mm-collapse', iconStyle: SVGICON.Bootstrap,
        content: [
            { title: 'Accordion', to: 'ui-accordion', },
            { title: 'Alert', to: 'ui-alert', },
            { title: 'Badge', to: 'ui-badge', },
            { title: 'Button', to: 'ui-button', },
            { title: 'Modal', to: 'ui-modal', },
            { title: 'Button Group', to: 'ui-button-group', },
            { title: 'List Group', to: 'ui-list-group', },
            { title: 'Cards', to: 'ui-card', },
            { title: 'Carousel', to: 'ui-carousel', },
            { title: 'Dropdown', to: 'ui-dropdown', },
            { title: 'Popover', to: 'ui-popover', },
            { title: 'Progressbar', to: 'ui-progressbar', },
            { title: 'Tab', to: 'ui-tab', },
            { title: 'Typography', to: 'ui-typography', },
            { title: 'Pagination', to: 'ui-pagination', },
            { title: 'Grid', to: 'ui-grid', },
        ]
    },
    //plugins
    {
        title: 'Plugins', classsChange: 'mm-collapse', iconStyle: SVGICON.Plugins,
        content: [
            { title: 'Select 2', to: 'uc-select2', },
            { title: 'Sweet Alert', to: 'uc-sweetalert', },
            { title: 'Toastr', to: 'uc-toastr', },            
            { title: 'Light Gallery', to: 'uc-lightgallery', },
        ]
    },
    //Widget
    { title: 'Widget', iconStyle: SVGICON.Widget, to: 'widget-basic', },
    //Forms
    {
        title: 'Forms', classsChange: 'mm-collapse', iconStyle: SVGICON.Forms,
        content: [
            { title: 'Form Elements', to: 'form-element', },
            { title: 'Wizard', to: 'form-wizard', },
            { title: 'CkEditor', to: 'form-ckeditor', },
            { title: 'Pickers', to: 'form-pickers', },
            { title: 'Form Validate', to: 'form-validation', },
        ]
    },
    //Table
    {
        title: 'Table', classsChange: 'mm-collapse', iconStyle: SVGICON.Table,
        content: [
            // { title: 'Table Filtering', to: 'table-filtering', },
            { title: 'Table Sorting', to: 'table-sorting', },
            { title: 'Bootstrap', to: 'table-bootstrap-basic', },
        ]
    },
    // Svgicon 
    { title: 'Svg Icons', iconStyle: SVGICON.SvgMenu, to: 'svg-icons', },
    //Pages
    {
        title: 'Pages', classsChange: 'mm-collapse', iconStyle: SVGICON.Pages,
        content: [
            {
                title: 'Error', hasMenu: true,
                content: [
                    { title: 'Error 400', to: 'page-error-400', },
                    { title: 'Error 403', to: 'page-error-403', },
                    { title: 'Error 404', to: 'page-error-404', },
                    { title: 'Error 500', to: 'page-error-500', },
                    { title: 'Error 503', to: 'page-error-503', },
                ],
            },
            { title: 'Lock Screen', to: 'page-lock-screen', },
        ]
    },
];

