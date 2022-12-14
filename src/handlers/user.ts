import { Request, Response } from 'express';
import prisma from '../prisma';
import { comparePassword, createJWT, hashPassword } from '../utils/auth';

export const createNewUser = async (req: Request, res: Response) => {
	if (!req.body.password && !req.body.user) {
		res.status(404);
		res.json({
			message: 'Nope',
		});

		return;
	}

	const user = await prisma.user.create({
		data: {
			username: req.body.username,
			password: await hashPassword(req.body.password),
		},
	});

	const token = createJWT(user);
	res.json({ token });
};

export const signIn = async (req: Request, res: Response) => {
	const user = await prisma.user.findUnique({
		where: {
			username: req.body.username,
		},
	});

	if (!user) {
		res.status(401);
		res.json({
			message: 'Invalid Password or Username!',
		});
		return;
	}

	const isValid = comparePassword(req.body.password, user.password);
	if (!isValid) {
		res.status(401);
		res.json({
			message: 'Invalid Password or Username!',
		});
		return;
	}

	const token = createJWT(user);
	res.json({ token });
};
