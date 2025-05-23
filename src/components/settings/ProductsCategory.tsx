import {FunctionComponent, useEffect, useState} from "react";
import {deleteProduct, getProductsByCategory} from "../../services/productsServices"; // פונקציה כללית שמביאה מוצרים לפי קטגוריה
import {Products} from "../../interfaces/Products";
import {handleAddToCart, handleQuantity} from "../../helpers/fruitesFunctions";
import {useUser} from "../../context/useUSer";
import Loader from "../../atoms/loader/Loader";
import UpdateProductModal from "../../atoms/productsManage/UpdateProductModal";
import {showError, showSuccess} from "../../atoms/toasts/ReactToast";
import Tooltip from "@mui/material/Tooltip";
import RoleType from "../../interfaces/UserType";
import {useCartItems} from "../../context/useCart";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Fab from "@mui/material/Fab";
import {Box, Button, Card, CardMedia, Chip, CircularProgress} from "@mui/material";
import AlertDialogs from "../../atoms/toasts/Sweetalert";
import Seo from "../../atoms/Seo/Seo";
import {getFaviconForCategory} from "../../FontAwesome/tapIcons";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import {path} from "../../routes/routes";
import ColorsAndSizes from "../../atoms/productsManage/ColorsAndSizes";
import {CssVarsProvider} from "@mui/joy/styles";

interface ProductCategoryProps {
	category: string;
}
/**
 * Categorys product by category
 * @param {category}
 * @returns products by categoties
 */
const ProductCategory: FunctionComponent<ProductCategoryProps> = ({
	category,
}: ProductCategoryProps) => {
	const [productNameToUpdate, setProductNameToUpdate] = useState<string>("");
	const [products, setProducts] = useState<Products[]>([]);
	const [quantities, setQuantities] = useState<{[key: string]: number}>({});
	const [loading, setLoading] = useState<boolean>(true);
	const {auth, isLoggedIn} = useUser();
	const [visibleProducts, setVisibleProducts] = useState<Products[]>([]); // To hold the visible products
	const [showMoreLoading, setShowMoreLoading] = useState<boolean>(false);
	const [showUpdateProductModal, setOnShowUpdateProductModal] =
		useState<boolean>(false);
	const [productToDelete, setProductToDelete] = useState<string>("");
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [loadingAddToCart, setLoadingAddToCart] = useState<string | null>(null);
	const [refresh, setRefresh] = useState<boolean>(false);

	const {setQuantity} = useCartItems();
	const navigate = useNavigate();

	const openDeleteModal = (name: string) => {
		setProductToDelete(name);
		setShowDeleteModal(true);
	};
	const closeDeleteModal = () => setShowDeleteModal(false);

	const {t} = useTranslation();

	// Update product
	const onShowUpdateProductModal = () => setOnShowUpdateProductModal(true);
	const onHideUpdateProductModal = () => setOnShowUpdateProductModal(false);

	const icons = getFaviconForCategory(category);

	const refreshAfterCange = () => setRefresh(!refresh);

	const handleAdd = (
		product_name: string,
		quantity: {[key: string]: number},
		price: number,
		product_image: string,
		sale: boolean,
		discount: number,
	) => {
		const productQuantity = quantity[product_name];

		if (!isLoggedIn) {
			navigate(path.Login);
		} else {
			setLoadingAddToCart(product_name);
			handleAddToCart(
				setQuantities,
				product_name,
				productQuantity,
				price - (price * discount) / 100,
				product_image,
				sale,
				discount,
			).then(() => {
				setQuantity((prev) => prev + 1);
				setLoadingAddToCart(null);
			});
		}
	};

	const handleDelete = (product_name: string) => {
		deleteProduct(product_name)
			.then(() => {
				showSuccess("המוצר נמחק בהצלחה!");

				setProducts((prevProducts) =>
					prevProducts.filter((p) => p.product_name !== product_name),
				);
			})
			.catch((err) => {
				console.error(err);
				showError("שגיאה במחיקת המוצר!");
			});
	};

	useEffect(() => {
		getProductsByCategory(category)
			.then((res) => {
				setProducts(res);

				setVisibleProducts(res.slice(0, 16));

				const initialQuantities = res.reduce(
					(acc: any, product: {product_name: string}) => {
						acc[product.product_name] = 1;
						return acc;
					},
					{},
				);
				setQuantities(initialQuantities);
				setLoading(false);
			})
			.catch((err) => {
				console.log(err);
			})
			.finally(() => setLoading(false));
	}, []);

	const handleShowMore = () => {
		setShowMoreLoading(true);
		const nextVisibleCount = visibleProducts.length + 16; // Load more products by slicing the products array
		const newVisibleProducts = products.slice(0, nextVisibleCount);
		setVisibleProducts(newVisibleProducts);
		setShowMoreLoading(false);
	};

	if (loading) {
		return <Loader />;
	}

	return (
		<>
			<Seo
				title={t("seo.categoryTitle", {category: t(`categories.${category}`)})}
				description={t("seo.categoryDescription", {
					category: t(`categories.${category}`),
				})}
				image={icons}
				type='category'
			/>
			<main className='min-vh-100'>
				<div className='container pb-5'>
					<div className='row gy-4 row-cols-xl-4 row-cols-md-3'>
						{visibleProducts.map((product: Products) => {
							const productQuantity = quantities[product.product_name] || 1;

							return (
								<Box className='col ' key={product.product_name}>
									<Card className='card h-100 shadow rounded-4 overflow-hidden'>
										<CardMedia
											component='img'
											lang='he'
											loading='lazy'
											image={product.image_url}
											alt={product.product_name}
											title={product.product_name}
											sx={{
												objectFit: "cover",
											}}
										/>
										<Box className='card-body d-flex flex-column justify-content-between'>
											<h6 className='card-title text-center fw-bold'>
												{product.product_name}
											</h6>
											<h6
												className={`text-center fw-semibold ${
													product.quantity_in_stock <= 0
														? "text-danger"
														: "text-success"
												}`}
											>
												{product.quantity_in_stock <= 0
													? "אזל מהמלאי"
													: `במלאי ${product.quantity_in_stock}`}
											</h6>

											{product.sale ? (
												<>
													<h6 className='text-center'>
														מחיר לפני:
														<s className='ms-2'>
															{product.price.toLocaleString(
																"he-IL",
																{
																	style: "currency",
																	currency: "ILS",
																},
															)}
														</s>
													</h6>
													<Chip
														label={`${product.discount}% הנחה`}
														color='error'
														size='small'
													/>
													<h5 className='text-center fw-bold text-success'>
														מחיר:
														{(
															product.price -
															(product.discount
																? (product.price *
																		product.discount) /
																	100
																: 0)
														).toLocaleString("he-IL", {
															style: "currency",
															currency: "ILS",
														})}
													</h5>
												</>
											) : (
												<h6 className='card-text text-center  fw-bold'>
													מחיר:
													{product.price.toLocaleString(
														"he-IL",
														{
															style: "currency",
															currency: "ILS",
														},
													)}
												</h6>
											)}

											<h6 className='text-center text-muted small'>
												{category === "spices"
													? "ל / 100-גרם"
													: [
																"fruit",
																"vegetable",
																"meat",
																"fish",
														  ].includes(category)
														? "ל / ק" + "\u05B2" + "ג"
														: "ל-יחידה"}
											</h6>
											<Box
												sx={{
													margin: "auto",
													textAlign: "center",
													p: 0,
												}}
											>
												<ColorsAndSizes category={category} />
											</Box>
											<Box className='d-flex align-items-center justify-content-center gap-3'>
												<button
													disabled={
														product.quantity_in_stock <= 0
													}
													onClick={() =>
														handleQuantity(
															setQuantities,
															"-",
															product.product_name,
														)
													}
													className='btn btn-light border rounded-circle shadow-sm'
												>
													<img
														src='/svg/remove.svg'
														alt=''
														width={15}
													/>
												</button>
												<h5 className='fs-6 fw-bold'>
													<b>{productQuantity}</b>
												</h5>
												<button
													disabled={
														product.quantity_in_stock <= 0
													}
													onClick={() =>
														handleQuantity(
															setQuantities,
															"+",
															product.product_name,
														)
													}
													className='btn btn-light border rounded-circle shadow-sm'
												>
													<img
														src='/svg/add.svg'
														alt=''
														width={15}
													/>
												</button>
											</Box>
											<Button
												onClick={() => {
													handleAdd(
														product.product_name,
														quantities,
														product.price,
														product.image_url,
														product.sale || false,
														product.discount || 0,
													);
												}}
												disabled={
													product.quantity_in_stock <= 0 ||
													loadingAddToCart ===
														product.product_name
												}
												className={`w-100 btn shadow-sm mt-2 fw-bold rounded-pill d-block ${
													product.quantity_in_stock <= 0
														? "btn btn-outline-danger"
														: "btn btn-outline-primary"
												}`}
											>
												{loadingAddToCart ===
												product.product_name ? (
													<CircularProgress
														size={20}
														color='inherit'
													/>
												) : product.quantity_in_stock <= 0 ? (
													"אזל מהמלאי"
												) : (
													"הוספה לסל"
												)}
											</Button>
											{((auth && auth.role === RoleType.Admin) ||
												(auth &&
													auth.role ===
														RoleType.Moderator)) && (
												<Box className='card-footer mt-3 bg-transparent border-0 d-flex justify-content-around'>
													<Tooltip title='עריכה'>
														<Fab
															color='warning'
															aria-label='עריכה'
															onClick={() => {
																setProductNameToUpdate(
																	product.product_name,
																);
																onShowUpdateProductModal();
															}}
															size='small'
															className='z-1'
														>
															<EditIcon />
														</Fab>
													</Tooltip>
													<Tooltip title='מחיקה'>
														<Fab
															color='error'
															aria-label='מחיקה'
															onClick={() =>
																openDeleteModal(
																	product.product_name,
																)
															}
															size='small'
															className='z-1'
														>
															<DeleteIcon />
														</Fab>
													</Tooltip>
												</Box>
											)}
										</Box>
									</Card>
								</Box>
							);
						})}
					</div>
					{/* Show More Button */}
					{products.length > visibleProducts.length && (
						<div className='text-center my-4 '>
							<Button
								onClick={handleShowMore}
								color='primary'
								variant='contained'
								size='large'
								disabled={showMoreLoading}
								className='rounded-pill shadow'
							>
								הצג עוד מוצרים
							</Button>
						</div>
					)}
				</div>

				<UpdateProductModal
					refresh={refreshAfterCange}
					product_name={productNameToUpdate}
					show={showUpdateProductModal}
					onHide={() => onHideUpdateProductModal()}
				/>

				<AlertDialogs
					show={showDeleteModal}
					onHide={closeDeleteModal}
					handleDelete={() => handleDelete(productToDelete)}
					title={"אתה עומד למחוק מוצר מהחנות"}
					description={`האם אתה בטוח שברצונך למחוק את המוצר ( ${productToDelete} ) ? פעולה זו לא ניתנת לביטול`}
				/>
			</main>
		</>
	);
};

export default ProductCategory;
