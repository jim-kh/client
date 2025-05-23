import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import {InputBase, Paper, IconButton, Box} from "@mui/material";
import {FunctionComponent} from "react";

interface SearchBoxProps {
	searchQuery: string;
	setSearchQuery:Function
	text:string
}

const SearchBox: FunctionComponent<SearchBoxProps> = ({text,searchQuery,setSearchQuery}) => {
	return (
		<Box>
			<Paper
				component='div'
				onSubmit={(e) => e.preventDefault()}
				sx={{
					width: {xs: "90%", sm: 400},
					m: "auto",
					mb: 4,
					fontSize: "0.5rem",
					p: "2px 10px",
					display: "flex",
					alignItems: "center",
					borderRadius: "50px",
					background: "rgba(255, 255, 255, 0.08)",
					boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
					backdropFilter: "blur(10px)",
					border: "1px solid rgba(255, 255, 255, 0.2)",
					transition: "0.3s ease",
					"&:hover": {
						boxShadow: "0 6px 25px rgba(0, 0, 0, 0.4)",
					},
				}}
			>
				<SearchIcon sx={{color: "#66b2ff", mr: 1}} />
				<InputBase
					sx={{
						color: "#696969",
						mr: 2,
						flex: 1,
						fontSize: "0.5rem",
						"& input::placeholder": {
							color: "#216cf8",
						},
					}}
					placeholder={text}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					inputProps={{"aria-label": "search"}}
				/>
				<IconButton onClick={() => setSearchQuery("")} size='small'>
					<CloseIcon fontSize='small' />
				</IconButton>
			</Paper>
		</Box>
	);
};
export default SearchBox;
