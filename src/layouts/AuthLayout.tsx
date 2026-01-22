import EYPLEASE_LOGO from "@/assets/icons/icon.png";

interface Props {
	children: React.ReactNode;
}

//bg-gradient-to-tr from-[#231f56] via-[#3d0a6e] to-[#f0047f]

const AuthLayout = ({ children }: Props) => {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10 bg-white">
				<div className="flex justify-center gap-2 md:justify-start">
					<a href="#" className="flex items-center gap-2 font-medium text-primary">
						<img src={EYPLEASE_LOGO} className="size-8 rounded-md" />
						Admin Eyplease+
					</a>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs">
						{children}
					</div>
				</div>
			</div>
			<div className="bg-muted relative hidden lg:block">
				<img
					src={EYPLEASE_LOGO}
					alt="Image"
					className="absolute inset-0 h-full w-full object-cover"
				/>
			</div>
		</div>
	)
}

export default AuthLayout;