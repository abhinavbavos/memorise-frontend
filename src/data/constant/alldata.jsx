import { IMAGES, SVGICON } from "./theme";

// dashboard homepage and dark homepage
export const iconBoxcard = [
    { title: 'Total Orders', number: '683', icon: SVGICON.DashHome },
    { title: 'Total Menus', number: '56,234', icon: SVGICON.GroupCoin },
    { title: 'Total Revenue', number: '$4,982', icon: SVGICON.MessagePing },
    { title: 'Total Customer', number: '12,094', icon: SVGICON.DoubleUser },
];
export const progressData = [
    { title: 'On Delivery', data: '6,245', color: 'bg-primary', status: '30%', iconColoe: '#3B42F0' },
    { title: 'Delivered', data: '2,355', color: 'bg-success', status: '60%', iconColoe: '#4FD66E' },
    { title: 'Canceled', data: '9,456', color: 'bg-warning', status: '10%', iconColoe: '#FF8D0E' },
];
export const customerBlog = [
    { title: 'Washington Franklin', color1: 'var(--primary)', color2: 'bg-primary-light' },
    { title: 'Franklin Avenue ', color1: 'var(--secondary)', color2: 'bg-secondary-light' },
    { title: 'Arlington Avenue ', color1: '#3CD860', color2: 'bg-success-light' },
    { title: 'Lebanon Avenue ', color1: '#6E6E6E', color2: 'bg-info-light' },
    { title: 'Springfield Avenue ', color1: 'var(--secondary)', color2: 'bg-secondary-light' },
    { title: 'South Franklin ', color1: 'var(--primary)', color2: 'bg-primary-light' },
];
export const recentBlog = [
    { image: IMAGES.coustomer1, title: 'James Sukardi' },
    { image: IMAGES.coustomer2, title: 'Melanie Subarjo' },
    { image: IMAGES.coustomer3, title: 'Kevin Sandjaja' },
    { image: IMAGES.coustomer2, title: 'James Sukardi' },
    { image: IMAGES.coustomer3, title: 'Sandjaja James' },
    { image: IMAGES.coustomer1, title: 'Kevin Sandjaja' },
];
export const options = [
    { value: '1', label: 'Daily' },
    { value: '2', label: 'Week' },
    { value: '3', label: 'Month' },
]
// dashboard reviews
export const reviewCard = [
    { image: IMAGES.profile25, name: 'Juan Martinez', location: 'Spanish', followers: '42', reviews: '56', date: '15/08/2023', },
    { image: IMAGES.profile17, name: 'Chihiro Yamamoto', location: 'Japanese', followers: '38', reviews: '86', date: '20/08/2023', },
    { image: IMAGES.profile18, name: 'Emre Öztürk', location: 'Turkish', followers: '46', reviews: '74', date: '30/08/2023', },
    { image: IMAGES.profile19, name: 'Isabella Rossi', location: 'Italian', followers: '50', reviews: '63', date: '08/09/2023', },
    { image: IMAGES.profile1, name: 'Alexandre Dupont', location: 'French', followers: '29', reviews: '89', date: '17/09/2023', },
    { image: IMAGES.profile18, name: 'Priya Patel', location: 'Indian', followers: '39', reviews: '95', date: '25/09/2023', },
];
// dashboar orderdetails
export const historyData = [
    { title: 'Your Order on Delivery by Courir', timing: '11:30 AM', },
    { title: 'Driver Arrived at Restaurant', timing: '01:50 PM', },
    { title: 'Preparing Your Order', timing: '02:20 PM', },
    { title: 'Placed Order', timing: '04:05 PM', },
];
export const foodItem = [
    { image: IMAGES.favirate5, title: 'Original Big Burger with Extra Spicy', amount: '17.50' },
    { image: IMAGES.favirate6, title: 'Big Pizza with Extra Spicy or Cheese', amount: '15.50' },
];
// dashboard customers 
export const tableData2 = [
    { id: '1', image: IMAGES.contact1, name: 'Luca Ferrari', location: 'Italian', amount: '924,23', lastorder: '125', },
    { id: '2', image: IMAGES.contact2, name: 'Anna Petrova', location: 'Russian', amount: '854,71', lastorder: '985', },
    { id: '3', image: IMAGES.contact3, name: 'Ahmed Hassan', location: 'Egyptian', amount: '654,23', lastorder: '771', },
    { id: '4', image: IMAGES.contact9, name: 'Ingrid Jensen', location: 'Norwegian', amount: '478,25', lastorder: '258', },
    { id: '5', image: IMAGES.contact5, name: 'Hiroshi Tanaka', location: 'Japanese', amount: '745,38', lastorder: '368', },
    { id: '6', image: IMAGES.contact6, name: 'Isabela Silva', location: 'Portuguese', amount: '784,35', lastorder: '654', },
    { id: '7', image: IMAGES.contact7, name: 'Karl Schmidt ', location: 'German', amount: '987,54', lastorder: '741', },
    { id: '8', image: IMAGES.contact8, name: 'Amara Desai', location: 'Indian', amount: '365,41', lastorder: '368', },
    { id: '9', image: IMAGES.contact9, name: 'Emilio Fernandez', location: 'Mexican', amount: '126,45', lastorder: '154', },
    { id: '10', image: IMAGES.contact1, name: 'Li Wei', location: 'Chinese', amount: '874,45', lastorder: '753', },
    { id: '11', image: IMAGES.contact3, name: 'Ahmed Hassan', location: 'Egyptian', amount: '654,23', lastorder: '771', },
    { id: '12', image: IMAGES.contact9, name: 'Ingrid Jensen', location: 'Norwegian', amount: '478,25', lastorder: '258', },
    { id: '13', image: IMAGES.contact5, name: 'Hiroshi Tanaka', location: 'Japanese', amount: '745,38', lastorder: '368', },
    { id: '14', image: IMAGES.contact6, name: 'Isabela Silva', location: 'Portuguese', amount: '784,35', lastorder: '654', },
    { id: '15', image: IMAGES.contact7, name: 'Karl Schmidt ', location: 'German', amount: '987,54', lastorder: '741', },
    { id: '16', image: IMAGES.contact8, name: 'Amara Desai', location: 'Indian', amount: '365,41', lastorder: '368', },
];
// dashboard blog 
export const cardBlog = [
    { title: 'Education', image: IMAGES.Books },
    { title: 'News', image: IMAGES.News },
    { title: 'Ranking', image: IMAGES.Heart },
    { title: 'File Manager', image: IMAGES.File },
];
export const postDetial = [
    { image: IMAGES.Friends1, image2: IMAGES.contact1, theme: 'secondary', maintitle: 'DESIGNER', subtitle: 'Good programmers write code that humans can understand.', name: 'Marry', date: 'May 05' },
    { image: IMAGES.Friends2, image2: IMAGES.contact2, theme: 'primary', maintitle: 'SOFTWARE', subtitle: "Rogramming isn't about what you know; it's about what you can figure out.", name: 'Jarry', date: 'April 05' },
    { image: IMAGES.Friends3, image2: IMAGES.contact3, theme: 'warning', maintitle: 'MARKTING', subtitle: "Debugging is like being a detective in a crime movie where you're also the murderer.", name: 'Honey', date: 'May 10' },
    { image: IMAGES.Friends4, image2: IMAGES.contact7, theme: 'success', maintitle: 'SOFTWARE', subtitle: 'The best way to predict the future is to invent it.', name: 'Harry ', date: 'June 12' },
    { image: IMAGES.Friends2, image2: IMAGES.contact1, theme: 'secondary', maintitle: 'HARDWARE', subtitle: 'The best way to predict the future is to invent it.', name: 'Marry ', date: 'April 30' },
];
export const usersDetial = [
    { image1: IMAGES.Blogs1, image2: IMAGES.contact1, theme: 'warning', maintitle: 'DESIGNER', name: 'Marry', date: 'May 05' },
    { image1: IMAGES.Blogs2, image2: IMAGES.contact2, theme: 'primary', maintitle: 'SOFTWARE', name: 'Jarry', date: 'April 05' },
    { image1: IMAGES.Blogs3, image2: IMAGES.contact5, theme: 'secondary', maintitle: 'MARKTING', name: 'Honey', date: 'May 10' },
    { image1: IMAGES.Blogs4, image2: IMAGES.contact1, theme: 'info', maintitle: 'SOFTWARE', name: 'Harry ', date: 'June 12' },
];
export const seoToolsData = [
    { image1: IMAGES.Blogs5, image2: IMAGES.contact1, theme: 'secondary', title: "Debugging is like being a detective movie where you're also the murderer.", name: 'Marry', date: 'May 05' },
    { image1: IMAGES.Blogs6, image2: IMAGES.contact2, theme: 'info', title: "There are many variations of passages of Lorem Ipsum available.", name: 'Jarry', date: 'April 05' },
    { image1: IMAGES.Blogs3, image2: IMAGES.contact1, theme: 'primary', title: "Debugging is like being a detective movie where you're also the murderer.", name: 'Honey', date: 'May 10' },
    { image1: IMAGES.Blogs4, image2: IMAGES.contact1, theme: 'info', title: "Contrary to popular belief, Lorem Ipsum is not simply random text.", name: 'Harry ', date: 'June 12' },
];
export const thirdPostBlog = [
    { image1: IMAGES.Blogs3, image2: IMAGES.contact1, title: 'Debugging is like being' },
    { image1: IMAGES.Blogs1, image2: IMAGES.contact2, title: 'Debugging is like being' },
    { image1: IMAGES.Blogs2, image2: IMAGES.contact3, title: "It is a long established fact that a reader wiil" },
];
export const commentsblog = [
    { image: IMAGES.contact5, title: 'James Marry', subtitle: 'This is Nice!!' },
    { image: IMAGES.contact2, title: 'Robert Patricia', subtitle: 'This is Superb!!' },
    { image: IMAGES.contact1, title: 'John Jennifer', subtitle: 'This is Coments!!' },
];
// dashboard orderlist
export const tableData = [
    { id: '1', name: 'James Sitepu', location: 'Park London', amount: '214', status: 'On Delivery', statuscolor: 'primary' },
    { id: '2', name: 'Marquez Silaban', location: 'Park, Orange St', amount: '301', status: 'Canceled', statuscolor: 'danger ' },
    { id: '3', name: 'Joseph David', location: 'Center Park St', amount: '250', status: 'Delivered', statuscolor: 'success' },
    { id: '4', name: 'Richard Elijah', location: 'Maharashtra (India) ', amount: '325', status: 'On Delivery', statuscolor: 'primary' },
    { id: '5', name: 'Robert Silaban', location: 'Bavaria (Germany)', amount: '230', status: 'Canceled', statuscolor: 'danger' },
    { id: '6', name: 'James John', location: 'Sao Paulo (Brazil)', amount: '401', status: 'Delivered', statuscolor: 'success' },
    { id: '7', name: 'James Sitepu', location: 'Tokyo (Japan)', amount: '245', status: 'Canceled', statuscolor: 'danger' },
    { id: '8', name: 'Marquez Silaban', location: 'Alberta (Canada)', amount: '260', status: 'Delivered', statuscolor: 'success' },
    { id: '9', name: 'Joseph David', location: 'Yucatán (Mexico)', amount: '325', status: 'On Delivery', statuscolor: 'primary' },
    { id: '10', name: 'Richard Elijah', location: 'Lombardy (Italy)', amount: '340', status: 'Canceled', statuscolor: 'danger' },
    { id: '11', name: 'Joseph David', location: 'Center Park St', amount: '250', status: 'Delivered', statuscolor: 'success' },
    { id: '12', name: 'Richard Elijah', location: 'Maharashtra (India) ', amount: '325', status: 'On Delivery', statuscolor: 'primary' },
    { id: '13', name: 'Robert Silaban', location: 'Bavaria (Germany)', amount: '230', status: 'Canceled', statuscolor: 'danger' },
    { id: '14', name: 'James John', location: 'Sao Paulo (Brazil)', amount: '401', status: 'Delivered', statuscolor: 'success' },
    { id: '15', name: 'James Sitepu', location: 'Tokyo (Japan)', amount: '245', status: 'Canceled', statuscolor: 'danger' },
    { id: '16', name: 'Marquez Silaban', location: 'Alberta (Canada)', amount: '260', status: 'Delivered', statuscolor: 'success' },
];
// dashboard Analytics
export const orderSummary = [
    { number: '261', title: 'Order' },
    { number: '94', title: 'Delivery' },
    { number: '874', title: 'Delivered' },
    { number: '25', title: 'Canceled' },
];
export const sellingMenus = [
    { image: IMAGES.favirate3, title: 'Sweet Orange Juice from Magelang', category: 'BEVERAGES' },
    { image: IMAGES.favirate1, title: 'Spaghetti ltaliano With Mozarella cheese', category: 'FOOD' },
    { image: IMAGES.favirate1, title: 'Original Big Burger with Extra Spicy ', category: 'DESSERT' },
    { image: IMAGES.favirate3, title: 'Sweet Orange Juice from Magelang', category: 'BEVERAGES' },
    { image: IMAGES.favirate4, title: 'Medium Fresh Salad Less Sugar (All Fruits)', category: 'DESSERT' },
    { image: IMAGES.favirate2, title: 'Spaghetti ltaliano With Mozarella cheese', category: 'FOOD' },
];
export const menus = [
    { name: 'All', title: 'All Categories' },
    { name: 'BEVERAGES', title: 'Beverages' },
    { name: 'FOOD', title: 'Foods' },
    { name: 'DESSERT', title: 'Dessert' },
];
export const customerData = [
    { name: 'Isabella Rossi', location: 'Italian', image: IMAGES.profile25 },
    { name: 'Juan Martinez', location: 'Spanish', image: IMAGES.profile1 },
    { name: 'Chihiro', location: 'Japanese', image: IMAGES.profile17 },
    { name: 'Emre Öztürk', location: 'Turkish', image: IMAGES.profile18 },
    { name: 'Priya Patel', location: 'Indian', image: IMAGES.profile19 },
];
// appsmenu chat 
export const chatList = [
    { image: IMAGES.contactd1, name: 'Honey Risher', time: '6' },
    { image: IMAGES.contactd2, name: 'Liam Antony', time: '7' },
    { image: IMAGES.contact1, name: 'Ricky M', time: '8' },
    { image: IMAGES.contactd4, name: 'Elijah James', time: '9' },
    { image: IMAGES.contactd5, name: 'Oliver Noah', time: '10' },
    { image: IMAGES.contactd6, name: 'Ricky Antony', time: '12' },
    { image: IMAGES.contact7, name: 'Ankites Risher', time: '15' },
    { image: IMAGES.contact8, name: 'Sofia Garcia', time: '18' },
    { image: IMAGES.contact9, name: 'Luca Ferrari', time: '20' },
    { image: IMAGES.contact1, name: 'Anna Petrova', time: '25' },
    { image: IMAGES.contactd11, name: 'Ahmed Hassan', time: '28' },
    { image: IMAGES.contactd12, name: 'Ingrid Jensen', time: '30' },
    { image: IMAGES.contactd2, name: 'Hiroshi Tanaka', time: '35' },
    { image: IMAGES.contact3, name: 'Ingrid Jensen', time: '40' },
];
export const mediaBlog = [
    { image: IMAGES.chat1 },
    { image: IMAGES.chat2 },
    { image: IMAGES.chat3 },
    { image: IMAGES.chat4 },
    { image: IMAGES.chat5 },
    { image: IMAGES.chat2 },
    { image: IMAGES.chat1 },
    { image: IMAGES.chat4 },
    { image: IMAGES.chat5 },
    { image: IMAGES.chat3 },
];
export const documents = [
    { title: 'document.doc', image: IMAGES.doc },
    { title: 'describe.mp4', image: IMAGES.playbtn },
    { title: 'music.mp3', image: IMAGES.notes },
    { title: 'project.pdf', image: IMAGES.pdf },
    { title: 'songs.mp3', image: IMAGES.notes },
    { title: 'details.doc', image: IMAGES.doc },
];
// appmenu app profile1 
export const galleryBlog = [
    { image: IMAGES.Profile3 }, { image: IMAGES.Profile4 },
    { image: IMAGES.Profile2 }, { image: IMAGES.Profile4 },
    { image: IMAGES.Profile3 }, { image: IMAGES.Profile2 },
];
export const mediaBlog4 = [
    { image: IMAGES.Profile5, title: 'Collection of textile samples' },
    { image: IMAGES.Profile6, title: 'Collection of cloths samples' },
    { image: IMAGES.Profile7, title: 'Collection of fabric samples' },
];
// appmenu appprofile 2
export const aboutme = [
    { title: 'Software Engineer at W3itexperts', icon: 'fa-solid fa-briefcase', subtitle: 'Oct 2021 - Present' },
    { title: 'Techno India NJR Institute', icon: 'fa-solid fa-book', subtitle: 'Nov-2019 at University Usa' },
    { title: 'Lived In Usa', icon: 'fa-solid fa-location-dot', subtitle: 'Oct 2019 - Present' },
    { title: 'Blood Group', icon: 'fa-solid fa-layer-group', subtitle: 'A+' },
];
export const followers = [
    { title: 'Liam Antony', subtitle: 'Web Doveloper', image: IMAGES.contact1 },
    { title: 'Ricky Noah', subtitle: 'Php Doveloper', image: IMAGES.contact2 },
    { title: 'Oliver Elijah', subtitle: 'Ux Designer', image: IMAGES.contact3 },
    { title: 'James William', subtitle: 'Web Designer', image: IMAGES.contact4 },
    { title: 'Benjamin Lucas', subtitle: 'App Doveloper', image: IMAGES.contact1 },
];
export const mediaBlog2 = [
    { image: IMAGES.Profile5 },
    { image: IMAGES.Profile6 },
    { image: IMAGES.Profile7 },
];
export const friends = [
    { image: IMAGES.Friends3 },
    { image: IMAGES.contact2 },
    { image: IMAGES.contact3 },
    { image: IMAGES.Friends2 },
    { image: IMAGES.contact1 },
    { image: IMAGES.contact4 },
    { image: IMAGES.Friends4 },
    { image: IMAGES.Friends1 },
    { image: IMAGES.Friends3 },
    { image: IMAGES.contact2 },
    { image: IMAGES.contact3 },
    { image: IMAGES.Friends2 },
];
export const productBlog = [
    { bigimg: IMAGES.Post1, halfimage1: IMAGES.Post11, halfimage2: IMAGES.Post12 },
    { bigimg: IMAGES.Post2, halfimage1: IMAGES.Post12, halfimage2: IMAGES.Post13 },
];
// apps editprofile 
export const inputBlog = [
    { label: 'Name', value: 'John' },
    { label: 'Surname', value: 'Brahim' },
    { label: 'Specialty', value: 'Developer' },
    { label: 'Skills', value: 'HTML,  JavaScript,  PHP' },
];
export const options2 = [
    { value: '1', label: 'Select' },
    { value: '2', label: 'Male' },
    { value: '3', label: 'Female' },
    { value: '4', label: 'Other' }
]
export const options3 = [
    { value: '1', label: 'Russia' },
    { value: '2', label: 'Canada' },
    { value: '3', label: 'China' },
    { value: '4', label: 'India' }
]
export const options4 = [
    { value: '1', label: 'Krasnodar' },
    { value: '2', label: 'Tyumen' },
    { value: '3', label: 'Chelyabinsk' },
    { value: '4', label: 'Moscow' }
]
// apps postdetails
export const mediaBlog3 = [
    { image: IMAGES.Profile5 },
    { image: IMAGES.Profile6 },
    { image: IMAGES.Profile7 },
];
// ecommers productlist 
export const productListBlog = [
    { image: IMAGES.Product2, title: "Bacon Cheeseburger", price: '320' },
    { image: IMAGES.Product3, title: "Mushroom Swiss Burger", price: '430' },
    { image: IMAGES.Product4, title: "Jalapeno Burger", price: '140' },
    { image: IMAGES.Product5, title: "Hawaiian Burger", price: '220' },
    { image: IMAGES.Product6, title: "Hawaiian Luau Delight", price: '450' },
    { image: IMAGES.Product7, title: "Margherita Masterpiece", price: '160' },
];
// bootstrap accordian 
export const defaultAccordion = [
    { title: "Accordion Header One", text: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod.", bg: "primary", },
    { title: "Accordion Header Two", text: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod.", bg: "info", },
    { title: "Accordion Header Three", text: "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod.", bg: "success", },
];
export const sidebarData = [
    { title: 'Default Accordion', to: 'accordion-one', select: '' },
    { title: 'Accordion Bordered', to: 'accordion-two', select: '' },
    { title: 'Accordion without space', to: 'accordion-three', select: '' },
    { title: 'Accordion without space with border', to: 'accordion-four', select: '' },
    { title: 'Accordion indicator in left position', to: 'accordion-five', select: '' },
    { title: 'Accordion with icon', to: 'accordion-six', select: '' },
    { title: 'Accordion header background', to: 'accordion-seven', select: '' },
    { title: 'Accordion solid background', to: 'accordion-eight', select: '' },
    { title: 'Accordion active background', to: 'accordion-nine', select: '' },
    { title: 'Accordion header shadow', to: 'accordion-ten', select: '' },
    { title: 'Accordion Rounded Stylish', to: 'accordion-eleven', select: '' },
    { title: 'Accordion Gradient', to: 'accordion-twelve', select: '' },

];
// bootstrap alertsiderbar 
export const alertSidebar = [
    { title: 'Basic Alerts', to: 'basic-alerts' },
    { title: 'Solid color alerts', to: 'color-alerts' },
    { title: 'Square Alerts', to: 'square-alerts' },
    { title: 'Rounded Alerts', to: 'rounded-alerts' },
    { title: 'Dismissable Alerts', to: 'dismissable-alerts' },
    { title: 'Alerts Alt', to: 'alerts-alt' },
    { title: 'Solid Alt', to: 'solid-alt' },
    { title: 'Dismissable with solid', to: 'dismissable-solid' },
    { title: 'Alert with Link', to: 'alert-link-with' },
    { title: 'Alert with Link and Solid Color', to: 'alert-link-color' },
    { title: 'Inline Notifications', to: 'notifications' },
    { title: 'Alert Icon Left', to: 'alert-icon-left' },
    { title: 'Alert outline', to: 'alert-outline' },
    { title: 'Alert Social', to: 'alert-social' },
    { title: 'Message Alert', to: 'message-alert' },
    { title: 'Message Alert Color', to: 'message-alert-color' },
    { title: 'Alert left icon big', to: 'alert-icon-big' },
];
// bootstrap badge 
export const sidebarLink = [
    { to: 'badges-size', title: 'Badges Size' },
    { to: 'badges-light', title: 'Badges Light' },
    { to: 'badges', title: 'Badges' },
    { to: 'pill-badge', title: 'Pill Badge' },
    { to: 'link-badge', title: 'Link Badge' },
    { to: 'rounded-badge', title: 'Rounded Badge' },
    { to: 'rounded-outline', title: 'Rounded Outline Badge' },
    { to: 'outline-circle', title: 'Outline Circle Badge' },
    { to: 'circle-badge', title: 'Circle Badge' },
    { to: 'circle-badge-default', title: 'Circle Badge Default' },
    { to: 'number-badge', title: 'Number Badge' },
    { to: 'badge-sizes', title: 'Badge Sizes' },
];
// bootstrap button 
export const buttonsidebarLink = [
    { title: 'Default Button', to: 'default-button' },
    { title: 'Buttons With Icon', to: 'button-with-icon' },
    { title: 'Button Light', to: 'button-light' },
    { title: 'Default Outline Button', to: 'default-outline-button' },
    { title: 'Button Sizes', to: 'button-sizes' },
    { title: 'Button Sizes Icon', to: 'button-size-icon' },
    { title: 'Outline Button Sizes', to: 'outline-button-sizes' },
    { title: 'Rounded Buttons', to: 'rounded-buttons' },
    { title: 'Rounded Outline Buttons', to: 'rounded-outline-buttons' },
    { title: 'Button Right Icons', to: 'button-right-icons' },
    { title: 'Button Left Icons', to: 'button-left-icons' },
    { title: 'Square Buttons', to: 'square-buttons' },
    { title: 'Square Outline Buttons', to: 'square-outline-buttons' },
    { title: 'Rounded Button', to: 'rounded-button' },
    { title: 'Buttons Transparent', to: 'buttons-transparent' },
    { title: 'Buttons Transparent Light', to: 'buttons-transparent-light' },
    { title: 'Disabled Button', to: 'disabled-button' },
    { title: 'Socia icon Buttons with Name', to: 'socia-icon-buttons' },
];
// bootstrap buttongroup 
export const buttongroupsidebarLink = [
    { title: 'Button Group', to: 'button-group' },
    { title: 'Button Toolbar', to: 'button-toolbar' },
    { title: 'Button Sizing', to: 'button-sizing' },
    { title: 'Button Nesting', to: 'button-nesting' },
    { title: 'Vertical Variation', to: 'vertical-variation' },
    { title: 'Vertical Dropdown Variation', to: 'vertical-dropdown' },
];
// bootstrap listgroup
export const listgroupsidebarLink = [
    { title: 'Basic List Group', to: 'basic-list' },
    { title: 'List Active items', to: 'list-active' },
    { title: 'List Disabled Item', to: 'list-disabled' },
    { title: 'Link And Button Item', to: 'link-button' },
    { title: 'Flush', to: 'flush' },
    { title: 'With Badges', to: 'with-badges' },
    { title: 'Custom Content', to: 'custom-content' },
    { title: 'Contextual', to: 'contextual' },
    { title: 'List-Tab', to: 'list-tab' },
];
export const listItem = [
    "Cras justo odio",
    "Dapibus ac facilisis in",
    "Morbi leo risus",
    "Porta ac consectetur ac",
    "Vestibulum at eros",
];
// bootstrap Cards 
export const cardsidebarLink = [
    { title: 'Card Title', to: 'card-title-1' },
    { title: 'Card Title-2', to: 'card-title-2' },
    { title: 'Card Title-3', to: 'card-title-3' },
    { title: 'Special Title Treatment', to: 'special-title' },
    { title: 'Primary Card Title', to: 'primary-card' },
    { title: 'Secondary Card Title', to: 'secondary-card' },
    { title: 'Success Card Title', to: 'success-card' },
    { title: 'Danger Card Title', to: 'danger-card' },
    { title: 'Warning Card Title', to: 'warning-card' },
    { title: 'Info Card Title', to: 'info-card' },
    { title: 'Light Card Title', to: 'light-card' },
    { title: 'Dark Card Title', to: 'dark-card' },
    { title: 'Card Title-4', to: 'card-title-4' },
    { title: 'Card Title-5', to: 'card-title-5' },
    { title: 'Card Title-6', to: 'card-title-6' },
]
// bootstrap carousel 
export const carouselsidebarLink = [
    { title: 'Slides', to: 'slides-only' },
    { title: 'With Captions', to: 'with-captions' },
    { title: 'Only Slides', to: 'slides-only-1' },
    { title: 'Slides With Indicators', to: 'slides-indicators' },
    { title: 'Slides With Captions', to: 'slides-captions' },
]
export const carousel1 = [IMAGES.img1, IMAGES.img2, IMAGES.img3]
export const carousel2 = [
    { img: IMAGES.img2, text: 'First' },
    { img: IMAGES.img3, text: 'Second' },
    { img: IMAGES.img4, text: 'Third' },
]
export const carousel3 = [IMAGES.img3, IMAGES.img4, IMAGES.img5]
export const carousel5 = [
    { img: IMAGES.img5, text: 'First' },
    { img: IMAGES.img6, text: 'Second' },
    { img: IMAGES.img7, text: 'Third' },
]
// bootstrap dropdown 
export const dropdownsidebarLink = [
    { to: 'basic-dropdown', title: 'Basic Dropdown' },
    { to: 'dropdown-divider', title: 'Dropdown Divider' },
    { to: 'dropdown-header', title: 'Dropdown Header' },
    { to: 'disable-active', title: 'Dropdown Disable' },
    { to: 'align-right', title: 'Align Right' },
    { to: 'dropup', title: 'Dropup' },
    { to: 'dropright', title: 'Dropright' },
    { to: 'dropstart', title: 'Dropstart' },
    { to: 'button-dropdowns', title: 'Button Dropdowns' },
    { to: 'sizing', title: 'Sizing' },
    { to: 'custom-style', title: 'Custom Style' },
];
// bootstrap progessbar 
export const progessbarsidebarLink = [
    { to: "default-progress", title: "Default Progress Bar" },
    { to: "striped-progress", title: "Striped Progress Bar" },
    { to: "colored-progress", title: "Colored Progress Bar" },
    { to: "different-bar", title: "Different Bar Sizes" },
    { to: "animated-striped", title: "Animated Striped Bars" },
    { to: "vertical-progress", title: "Vertical Progress Bars" },
    { to: "vertical-progress-bottom", title: "Vertical Progress From Bottom" },
    { to: "different-size", title: "Different Size Progress Bars" },
    { to: "animated-bars", title: "Animated Bars" },
    { to: "skill-bars", title: "Skill Bars" },
];
export const progressBarData = [
    { variant: "danger", value: "60" },
    { variant: "info", value: "40" },
    { variant: "success", value: "20" },
    { variant: "primary", value: "30" },
    { variant: "warning", value: "80" },
    { variant: "inverse", value: "40" },
];
// bootstrap tabs 
export const tabsidebarLink = [
    { to: 'default-tab', title: 'Default Tab' },
    { to: 'custom-tab', title: 'Custom Tab' },
    { to: 'nav-pills', title: 'Nav Pills Tabs' },
    { to: 'nav-pills-tabs', title: 'Nav Pills Tabs-2' },
    { to: 'vertical-nav', title: 'Vertical Nav Pill' },
    { to: 'vertical-nav-pill', title: 'Vertical Nav Pill-2' },
    { to: 'tab-icon', title: 'Tab with Icon' }
];
export const tabData = [
    { name: "Home", icon: "home", content: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove.", },
    { name: "Profile", icon: "user", content: "Raw denim you probably haven't heard of them jean shorts Austin. Nesciunt tofu stumptown aliqua, retro synth master cleanse. Mustache cliche tempor.      ", },
    { name: "Contact", icon: "phone", content: "Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove.", },
    { name: "Message", icon: "envelope", content: "Raw denim you probably haven't heard of them jean shorts Austin. Nesciunt tofu stumptown aliqua, retro synth master cleanse. Mustache cliche tempor.      ", },
];
// bootstrap pegination 
export const peginationsidebarLink = [
    { to: 'default-pagination', title: 'Default Pagination' },
    { to: 'pagination-gutter', title: 'Pagination Gutter' },
    { to: 'pagination-color', title: 'Pagination Color' },
    { to: 'pagination-circle', title: 'Pagination Circle' },
];
// plugins select2 
export const options5 = [
    { value: "chocolate", label: "Chocolate" },
    { value: "strawberry", label: "Strawberry" },
    { value: "vanilla", label: "Vanilla" },
];
// Plugin lightGallery 
export const lightGallery = [
    { large: IMAGES.img1, thumb: IMAGES.img1, },
    { large: IMAGES.img2, thumb: IMAGES.img2, },
    { large: IMAGES.img3, thumb: IMAGES.img3, },
    { large: IMAGES.img4, thumb: IMAGES.img4, },
    { large: IMAGES.img5, thumb: IMAGES.img5, },
    { large: IMAGES.img6, thumb: IMAGES.img6, },
    { large: IMAGES.img7, thumb: IMAGES.img7, },
    { large: IMAGES.img8, thumb: IMAGES.img8, },
];
// form element 
export const radiocheckBox = [
    { title: 'Checkbox 1', check: 'primary' }, { title: 'Checkbox 2', check: 'secondary' },
    { title: 'Checkbox 3', check: 'info' }, { title: 'Checkbox 4', check: 'success' },
    { title: 'Checkbox 5', check: 'warning' }, { title: 'Checkbox 6', check: 'danger' },
];
// svgicons 
export const svgBlogData = [
    { Iconname: '2 User.svg', svgtype: SVGICON.userdouble, },
    { Iconname: '3 User.svg', svgtype: SVGICON.userthree },
    { Iconname: 'Activity.svg', svgtype: SVGICON.Activity },
    { Iconname: 'Add User.svg', svgtype: SVGICON.adduser },
    { Iconname: 'Bag.svg', svgtype: SVGICON.Bag },
    { Iconname: 'Bag-3.svg', svgtype: SVGICON.Bag3 },
    { Iconname: 'Bookmark.svg', svgtype: SVGICON.Bookmark },
    { Iconname: 'Buy.svg', svgtype: SVGICON.Buy },
    { Iconname: 'Calendar.svg', svgtype: SVGICON.Calendar },
    { Iconname: 'Call.svg', svgtype: SVGICON.Call },
    { Iconname: 'Calling.svg', svgtype: SVGICON.Calling },
    { Iconname: 'Call-Missed.svg', svgtype: SVGICON.CallMissed },
    { Iconname: 'Call-Silent.svg', svgtype: SVGICON.CallSilent },
    { Iconname: 'Camera.svg', svgtype: SVGICON.Camera },
    { Iconname: 'Category.svg', svgtype: SVGICON.Category },
    { Iconname: 'Chart.svg', svgtype: SVGICON.Chart },
    { Iconname: 'Chat.svg', svgtype: SVGICON.Chat },
    { Iconname: 'Close-Square.svg', svgtype: SVGICON.Closesquare },
    { Iconname: 'Danger.svg', svgtype: SVGICON.Danger },
    { Iconname: 'Delete.svg', svgtype: SVGICON.Delete },
    { Iconname: 'Discount.svg', svgtype: SVGICON.Discount },
    { Iconname: 'Discovery.svg', svgtype: SVGICON.Discovery },
    { Iconname: 'Document.svg', svgtype: SVGICON.Document },
    { Iconname: 'Download.svg', svgtype: SVGICON.Download },
    { Iconname: 'Edit.svg', svgtype: SVGICON.Edit },
    { Iconname: 'Edit-Square.svg', svgtype: SVGICON.Editsquare },
    { Iconname: 'Filter.svg', svgtype: SVGICON.Filter },
    { Iconname: 'Filter-2.svg', svgtype: SVGICON.Filter2 },
    { Iconname: 'Folder.svg', svgtype: SVGICON.Folder },
    { Iconname: 'Game.svg', svgtype: SVGICON.Game },
    { Iconname: 'Graph.svg', svgtype: SVGICON.Graph },
    { Iconname: 'Heart.svg', svgtype: SVGICON.Heart },
    { Iconname: 'Hide.svg', svgtype: SVGICON.Hide },
    { Iconname: 'Home.svg', svgtype: SVGICON.HomeSvg },
    { Iconname: 'Image.svg', svgtype: SVGICON.Image },
    { Iconname: 'Image-3.svg', svgtype: SVGICON.Image3 },
    { Iconname: 'Info-Circle.svg', svgtype: SVGICON.Infocircle },
    { Iconname: 'Info-Square.svg', svgtype: SVGICON.Infosquare },
    { Iconname: 'Location.svg', svgtype: SVGICON.Location },
    { Iconname: 'Lock.svg', svgtype: SVGICON.Lock },
    { Iconname: 'login.svg', svgtype: SVGICON.login },
    { Iconname: 'Logout.svg', svgtype: SVGICON.Logoutsvg },
    { Iconname: 'Message.svg', svgtype: SVGICON.Messagesvg },
    { Iconname: 'More-Circle.svg', svgtype: SVGICON.Morecircle },
    { Iconname: 'Notification.svg', svgtype: SVGICON.Notificationsvg },
    { Iconname: 'Paper.svg', svgtype: SVGICON.Paper },
    { Iconname: 'Paper-Download.svg', svgtype: SVGICON.Paperdownload },
    { Iconname: 'Paper-Fail.svg', svgtype: SVGICON.Paperfail },
    { Iconname: 'Password.svg', svgtype: SVGICON.Password },
    { Iconname: 'Pape-Plus.svg', svgtype: SVGICON.Papeplus },
    { Iconname: 'Play.svg', svgtype: SVGICON.Play },
    { Iconname: 'Plus.svg', svgtype: SVGICON.Plus },
    { Iconname: 'Profile.svg', svgtype: SVGICON.Profile },
    { Iconname: 'Scan.svg', svgtype: SVGICON.Scan },
    { Iconname: 'Search.svg', svgtype: SVGICON.Search },
    { Iconname: 'Send.svg', svgtype: SVGICON.Send },
    { Iconname: 'Setting.svg', svgtype: SVGICON.Setting },
    { Iconname: 'Shielddone.svg', svgtype: SVGICON.Shielddone },
    { Iconname: 'Shield-Fail.svg', svgtype: SVGICON.Shieldfail },
    { Iconname: 'Show.svg', svgtype: SVGICON.Show },
    { Iconname: 'Star.svg', svgtype: SVGICON.Star },
    { Iconname: 'Swap.svg', svgtype: SVGICON.Swap },
    { Iconname: 'Ticket.svg', svgtype: SVGICON.Ticket },
    { Iconname: 'TicketStar.svg', svgtype: SVGICON.TicketStar },
    { Iconname: 'TicketSquare.svg', svgtype: SVGICON.TicketSquare },
    { Iconname: 'Timecircle.svg', svgtype: SVGICON.Timecircle },
    { Iconname: 'Time-Square.svg', svgtype: SVGICON.TimeSquare },
    { Iconname: 'Unlock.svg', svgtype: SVGICON.Unlock },
    { Iconname: 'Upload.svg', svgtype: SVGICON.Upload },
    { Iconname: 'Video.svg', svgtype: SVGICON.Video },
    { Iconname: 'Voice.svg', svgtype: SVGICON.Voice },
    { Iconname: 'Voice-3.svg', svgtype: SVGICON.Voice3 },
    { Iconname: 'Volume-Down.svg', svgtype: SVGICON.Volumedown },
    { Iconname: 'Volume-Off.svg', svgtype: SVGICON.VolumeOff },
    { Iconname: 'Volume-Up.svg', svgtype: SVGICON.VolumeUp },
    { Iconname: 'Wallet.svg', svgtype: SVGICON.Wallet },
    { Iconname: 'Work.svg', svgtype: SVGICON.Work },
    { Iconname: 'Arrow-Down-Circle.svg', svgtype: SVGICON.ArrowDownCircle },
    { Iconname: 'Arrow-Left-Circle.svg', svgtype: SVGICON.ArrowLeftCircle },
    { Iconname: 'Arrow-Right-Circle.svg', svgtype: SVGICON.ArrowRightCircle },
    { Iconname: 'Arrow-Up-Circle.svg', svgtype: SVGICON.ArrowUpCircle },
    { Iconname: 'Arrow-Down.svg', svgtype: SVGICON.ArrowDown },
    { Iconname: 'Arrow-Down-2.svg', svgtype: SVGICON.ArrowDown2 },
    { Iconname: 'Arrow-Down-3.svg', svgtype: SVGICON.ArrowDown3 },
    { Iconname: 'Arrow-Left.svg', svgtype: SVGICON.ArrowLeft },
    { Iconname: 'Arrow-Left-2.svg', svgtype: SVGICON.ArrowLeft2 },
    { Iconname: 'Arrow-Left-3.svg', svgtype: SVGICON.ArrowLeft3 },
    { Iconname: 'Arrow-Right.svg', svgtype: SVGICON.ArrowRight },
    { Iconname: 'Arrow-Right-2.svg', svgtype: SVGICON.ArrowRight2 },
    { Iconname: 'Arrow-Right-3.svg', svgtype: SVGICON.ArrowRight3 },
    { Iconname: 'Arrow-Down-Square.svg', svgtype: SVGICON.ArrowDownSquare },
    { Iconname: 'Arrow-Left-Square.svg', svgtype: SVGICON.ArrowLeftSquare },
    { Iconname: 'Arrow-Right-Square.svg', svgtype: SVGICON.ArrowRightSquare },
    { Iconname: 'Arrow-Up.svg', svgtype: SVGICON.ArrowUp },
    { Iconname: 'Arrow-Up-2.svg', svgtype: SVGICON.ArrowUp2 },
    { Iconname: 'Arrow-Up-3.svg', svgtype: SVGICON.ArrowUp3 },
    { Iconname: 'Arrow-Up-Square.svg', svgtype: SVGICON.ArrowUpSquare },
];
// menulist sidebar menu
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
]