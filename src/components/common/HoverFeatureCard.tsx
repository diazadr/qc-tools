import { motion } from "framer-motion";

interface Props {
    image: string;
    title: string;
    description: string;
}

const HoverFeatureCard = ({ image, title, description }: Props) => {
    return (
        <div className="relative w-full h-64 md:h-80 overflow-hidden rounded-lg cursor-pointer group">

            <img
                src={image}
                className="object-cover w-full h-full transform transition duration-500 group-hover:scale-105 opacity-90"
            />

            <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-bg/70 flex flex-col justify-center items-center text-center px-4"
            >
                <motion.div
                    initial={{ y: 20 }}
                    whileHover={{ y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <h3 className="text-2xl font-bold text-white mb-2">
                        {title}
                    </h3>
                    <p className="text-sm md:text-base text-secondary max-w-md">

                        {description}
                    </p>
                </motion.div>
            </motion.div>

        </div>
    );
};

export default HoverFeatureCard;
