import AutoResize from "react-textarea-autosize";
import { chakra, useRecipe } from "@chakra-ui/react";

const StyledAutoResize = chakra(AutoResize);

type AutoResizedTextareaProps = React.ComponentProps<typeof StyledAutoResize>;

export function AutoResizedTextarea(props: AutoResizedTextareaProps) {
	const recipe = useRecipe({ key: "textarea" });
	const styles = recipe({ size: "sm" });
	return <StyledAutoResize {...props} css={styles} />;
}
