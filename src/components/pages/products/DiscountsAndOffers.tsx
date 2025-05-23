import {FunctionComponent, useEffect, useState} from "react";
import {Products} from "../../../interfaces/Products";
import {getProductsInDiscount} from "../../../services/productsServices";
import {Link} from "react-router-dom";
import Loader from "../../../atoms/loader/Loader";
import {Skeleton} from "@mui/material";
import {useTranslation} from "react-i18next";
import {Swiper, SwiperSlide} from "swiper/react";
import {Autoplay, Scrollbar, Navigation, FreeMode, EffectCoverflow} from "swiper/modules";
import "swiper/css";
import "swiper/css/scrollbar";

interface DiscountsAndOffersProps {}

/**
 * Products in discount
 * @returns Products in discount
 */
const DiscountsAndOffers: FunctionComponent<DiscountsAndOffersProps> = () => {
	const {t} = useTranslation();
	const [productsInDiscount, setProductsInDiscount] = useState<Products[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});


	useEffect(() => {
		getProductsInDiscount()
			.then((res) => {
				setProductsInDiscount(res);
				setLoading(false);
			})
			.catch((error) => {
				console.error(error);
				setLoading(false);
			});
	}, []);

	const setImageLoaded = (id: string) => {
		setLoadedImages((prev) => ({...prev, [id]: true}));
	};

	if (loading) {
		return <Loader />;
	}

	return (
		<main>
			<div className='container'>
				<h1 className='text-center mb-4 display-5 fw-bold'>
					{t("categories.discountsAndOffers.discountsAndOffersHeading")}
				</h1>
				<p className='text-center lead mb-5'>
					<span className='d-block'>
						{t("categories.discountsAndOffers.discountsAndOffersSpan")}
					</span>
					{t("categories.discountsAndOffers.discountsAndOffersDescription")}
				</p>
			</div>

			<div className='border border-top-0 border-bottom-0 border-5 rounded-3'>
				<Swiper
					modules={[Autoplay, Scrollbar, Navigation, FreeMode, EffectCoverflow]}
					pagination={{clickable: true}}
					scrollbar={{draggable: true}}
					autoplay={{delay: 3000}}
					style={{height: "350px"}}
					loop={true}
					spaceBetween={10}
					slidesPerView={2}
					freeMode={true}
					coverflowEffect={{
						rotate: 20,
						stretch: 0,
						depth: 30,
						modifier: 3,
						slideShadows: true,
					}}
					effect='coverflow'
				>
					{productsInDiscount.map((product: Products) => {
						const isLoaded = loadedImages[product.product_name];

						return (
							<SwiperSlide key={product._id}>
								<div className='position-relative text-center'>
										{!isLoaded && (
											<Skeleton
												variant='rectangular'
												width='100%'
												height='300px'
												sx={{bgcolor: "grey.900"}}
											/>
										)}
									<Link to={product.category}>
										<img
											src={product.image_url}
											alt={product.product_name}
											className='img-fluid'
											style={{
												display: isLoaded ? "block" : "none",
												objectFit: "cover",
												height: "300px",
												width: "100%",
											}}
											onLoad={() =>
												setImageLoaded(product.product_name)
											}
											/>
										{/* מסכה מעל התמונה */}
										<div
											className='position-absolute top-0 start-0 w-100 h-100'
											style={{
												backgroundColor: "rgba(0, 0, 0, 0.596)",
											}}
											/>
										{/* טקסט מעל המסכה */}
										<div className='position-absolute top-50 start-50 translate-middle text-white'>
											<h5 className='fw-bold'>
												{product.product_name}
											</h5>
											<p className='text-danger fw-bold'>
												{product.sale
													? `הנחה ${product.discount}%`
													: ""}
											</p>
											<p>{product.description}</p>
										</div>
											</Link>
								</div>
							</SwiperSlide>
						);
					})}
				</Swiper>
			</div>
		</main>
	);
};

export default DiscountsAndOffers;
