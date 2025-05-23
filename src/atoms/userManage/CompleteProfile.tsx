import {useFormik} from "formik";
import * as yup from "yup";
import {showSuccess, showError} from "../toasts/ReactToast";
import {FunctionComponent, useEffect, useState} from "react";
import {Box, Button, CircularProgress, MenuItem, TextField} from "@mui/material";
import {Col, Form, Row} from "react-bootstrap";
import {compleateProfileData, getUserById} from "../../services/usersServices";
import useToken from "../../hooks/useToken";
import Loader from "../loader/Loader";
import useAddressData from "../../hooks/useAddressData";

interface CompleteProfileProps {}

/**
 * Auth complete profile
 * @returns inputs to colmplate the fileds on database
 */
const CompleteProfile: FunctionComponent<CompleteProfileProps> = () => {
	const {decodedToken} = useToken();
	const [loading, setIsLoading] = useState<boolean>(true);

	const formik = useFormik({
		initialValues: {
			phone: {phone_1: "", phone_2: ""},
			address: {city: "", street: "", houseNumber: ""},
		},
		enableReinitialize: true,
		validationSchema: yup.object({
			phone: yup.object({
				phone_1: yup
					.string()
					.matches(/^0\d{1,2}-?\d{7}$/, "מספר טלפון לא תקין בפורמט ישראלי")
					.required(),
				phone_2: yup
					.string()
					.matches(/^0\d{1,2}-?\d{7}$/, "מספר טלפון לא תקין בפורמט ישראלי"),
			}),
			address: yup.object({
				city: yup.string().required("נדרשת עיר"),
				street: yup.string().required("נדרש רחוב"),
				houseNumber: yup.string(),
			}),
		}),
		onSubmit: (values) => {
			if (decodedToken) {
				compleateProfileData(decodedToken._id, values)
					.then(() => {
						formik.setSubmitting(false);
						showSuccess("הפרופיל עודכן בהצלחה!");
					})
					.catch(() => {
						formik.setSubmitting(false);
						showError("שגיאה בעדכון הפרופיל");
					});
			}
		},
	});

	const {cities, streets, loadingStreets} = useAddressData(formik.values.address.city);

	useEffect(() => {
		async function getUser() {
			try {
				const user = await getUserById(decodedToken._id);

				formik.setValues({
					phone: {
						phone_1: user.phone?.phone_1 || "",
						phone_2: user.phone?.phone_2 || "",
					},
					address: {
						city: user.address.city || "בחר עיר",
						street: user.address.street || "שם רחוב לא הוזן",
						houseNumber: user.address.houseNumber || "",
					},
				});
			} catch (err) {
				console.log("Error getting user:", err);
				showError("שגיאה בטעינת הפרופיל");
			} finally {
				setIsLoading(false);
			}
		}
		if (decodedToken) {
			getUser();
		}
	}, [decodedToken]);

	if (loading) {
		return <Loader />;
	}

	return (
		<main
			style={{minHeight: "600px"}}
			className=' d-flex align-items-center justify-content-center'
		>
			<Box className='container d-flex align-items-center justify-content-center flex-column'>
				<h2 className='text-center'>השלמת פרופיל</h2>
				<Form onSubmit={formik.handleSubmit} className='mt-4'>
					<Row>
						<Col>
							<TextField
								label='טלפון ראשי'
								name='phone.phone_1'
								type='text'
								value={formik.values.phone.phone_1}
								onChange={formik.handleChange}
								error={
									formik.touched.phone?.phone_1 &&
									Boolean(formik.errors.phone?.phone_1)
								}
								helperText={
									formik.touched.phone?.phone_1 &&
									formik.errors.phone?.phone_1
								}
								fullWidth
								className='my-2'
								variant='outlined'
							/>
						</Col>

						<Col>
							<TextField
								label='טלפון נוסף (אופציונלי)'
								name='phone.phone_2'
								type='text'
								value={formik.values.phone.phone_2}
								onChange={formik.handleChange}
								fullWidth
								className='my-2'
								variant='outlined'
							/>
						</Col>
						<Row>
							<Col>
								<TextField
									select
									label='בחר עיר'
									name='address.city'
									value={formik.values.address.city}
									onChange={formik.handleChange}
									error={
										formik.touched.address?.city &&
										Boolean(formik.errors.address?.city)
									}
									helperText={
										formik.touched.address?.city &&
										formik.errors.address?.city
									}
									fullWidth
									className='my-2'
									variant='outlined'
									SelectProps={{
										MenuProps: {
											PaperProps: {
												style: {
													maxHeight: 300,
												},
											},
										},
									}}
								>
									<MenuItem value=''>בחר עיר</MenuItem>
									{cities.map((city, index) => (
										<MenuItem key={index} value={city}>
											{city}
										</MenuItem>
									))}
								</TextField>
							</Col>
							<Col>
								<TextField
									select
									label='בחר רחוב'
									name='address.street'
									value={formik.values.address.street}
									onChange={formik.handleChange}
									disabled={
										!formik.values.address.city || loadingStreets
									}
									error={
										formik.touched.address?.street &&
										Boolean(formik.errors.address?.street)
									}
									helperText={
										formik.touched.address?.street &&
										formik.errors.address?.street
									}
									fullWidth
									className='my-2'
									variant='outlined'
									SelectProps={{
										MenuProps: {
											PaperProps: {
												style: {
													maxHeight: 300,
												},
											},
										},
									}}
								>
									<MenuItem value=''>בחר רחוב</MenuItem>
									{loadingStreets ? (
										<MenuItem disabled>טוען רחובות...</MenuItem>
									) : (
										streets.map((street, index) => (
											<MenuItem key={index} value={street}>
												{street}
											</MenuItem>
										))
									)}
								</TextField>
							</Col>
							<Col>
								<TextField
									label='מספר בית'
									name='address.houseNumber'
									type='text'
									value={formik.values.address.houseNumber}
									onChange={formik.handleChange}
									fullWidth
									className='my-2'
									variant='outlined'
								/>
							</Col>
						</Row>
						<Box className='text-center mt-3 w-50 m-auto'>
							<Button
								type='submit'
								variant='contained'
								color='primary'
								disabled={formik.isSubmitting}
								fullWidth
							>
								{formik.isSubmitting ? (
									<CircularProgress size={24} color='inherit' />
								) : (
									"שמור"
								)}
							</Button>
						</Box>
					</Row>
				</Form>
			</Box>
		</main>
	);
};

export default CompleteProfile;
